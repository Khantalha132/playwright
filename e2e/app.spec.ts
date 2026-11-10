import { test, expect } from '@playwright/test';

// Runs with the saved session from auth.setup.ts
test.describe('Authenticated workspace', () => {
  test('lands inside the app after login', async ({ page }) => {
    await page.goto('/login');
    // Logged-in users are usually redirected away from /login
    await page.waitForLoadState('domcontentloaded');
    await page.goto('/');
    await expect(page.getByRole('link', { name: 'Sign in' })).toHaveCount(0);
  });

  test('workspace pages load without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));

    await page.goto('/');
    await page.screenshot({ path: 'test-results/workspace-home.png', fullPage: true });

    // Visit each sidebar / app navigation link (max 15)
    const links = await page
      .locator('aside a[href], nav[aria-label*="app" i] a[href]')
      .evaluateAll((as) => [...new Set(as.map((a) => (a as HTMLAnchorElement).href))]);

    for (const url of links.slice(0, 15)) {
      const res = await page.goto(url);
      expect.soft(res?.status(), url).toBeLessThan(400);
      await expect.soft(page.locator('body'), url).not.toBeEmpty();
    }
    expect(errors, errors.join('\n')).toEqual([]);
  });

  test('can sign out', async ({ page }) => {
    await page.goto('/');
    const logout = page.getByRole('button', { name: /log ?out|sign ?out/i })
      .or(page.getByRole('link', { name: /log ?out|sign ?out/i }))
      .first();

    if (!(await logout.isVisible())) {
      // Often hidden in a user/profile menu
      await page.getByRole('button', { name: /account|profile|user|menu/i }).first().click();
    }
    await logout.click();
    await expect(page).toHaveURL(/\/login|\/$/);
  });
});
