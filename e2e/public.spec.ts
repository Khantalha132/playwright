import { test, expect } from '@playwright/test';

const PAGES = [
  { path: '/', heading: /books, and customer pipeline/i },
  { path: '/features', heading: /.+/ },
  { path: '/solutions', heading: /.+/ },
  { path: '/pricing', heading: /.+/ },
  { path: '/about', heading: /.+/ },
  { path: '/contact', heading: /.+/ },
  { path: '/login', heading: /.+/ },
  { path: '/register', heading: /.+/ },
];

test.describe('Public pages', () => {
  for (const { path, heading } of PAGES) {
    test(`${path} loads`, async ({ page }) => {
      const errors: string[] = [];
      page.on('pageerror', (e) => errors.push(e.message));

      const res = await page.goto(path);
      expect(res?.status()).toBeLessThan(400);
      await expect(page).toHaveTitle(/.+/);
      await expect(page.getByRole('heading', { level: 1 }).first()).toContainText(heading);
      expect(errors, errors.join('\n')).toEqual([]);
    });
  }

  test('header navigation links go to the right pages', async ({ page, isMobile }) => {
    test.skip(isMobile, 'Desktop navigation only');
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main navigation' });

    for (const [name, url] of [
      ['Product', /\/features/],
      ['Solutions', /\/solutions/],
      ['Pricing', /\/pricing/],
      ['About', /\/about/],
      ['Contact', /\/contact/],
    ] as const) {
      await nav.getByRole('link', { name }).click();
      await expect(page).toHaveURL(url);
    }
  });

  test('"Start free" opens registration', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Start free' }).first().click();
    await expect(page).toHaveURL(/\/register/);
  });

  test('"Sign in" opens login', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Sign in' }).first().click();
    await expect(page).toHaveURL(/\/login/);
  });

  test('home page shows all feature cards', async ({ page }) => {
    await page.goto('/');
    for (const title of [
      'Invoicing', 'Bills & expenses', 'Banking', 'Accounting', 'Reports', 'Country tax', 'Hero AI',
    ]) {
      await expect(page.getByRole('heading', { name: title, level: 3 }).first()).toBeVisible();
    }
  });

  test('FAQ items are present', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('Does Hero Accounting include a CRM?')).toBeVisible();
    await expect(page.getByText('Does Hero Accounting provide tax advice?')).toBeVisible();
  });

  test('footer is present with legal links', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    for (const name of ['Pricing', 'About', 'Security', 'Privacy', 'Contact']) {
      await expect(footer.getByRole('link', { name }).first()).toBeVisible();
    }
  });

  test('all internal links respond with status < 400', async ({ page, request, baseURL }) => {
    await page.goto('/');
    const hrefs = await page
      .locator('a[href]')
      .evaluateAll((as) => as.map((a) => (a as HTMLAnchorElement).href));

    const urls = [...new Set(hrefs.map((h) => h.split('#')[0]))].filter((h) =>
      h.startsWith(baseURL!),
    );

    for (const url of urls) {
      const res = await request.get(url);
      expect.soft(res.status(), url).toBeLessThan(400);
    }
  });

  test('no horizontal overflow on home', async ({ page }) => {
    await page.goto('/');
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth > window.innerWidth + 1,
    );
    expect(overflow).toBe(false);
  });
});
