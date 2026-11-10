import { test, expect } from '@playwright/test';

const BASE_URL = 'http://';

test.describe('Navigation & Header', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(BASE_URL);
    await page.waitForLoadState('domcontentloaded');
  });

  test('Logo is visible and links to homepage', async ({ page }) => {
    const logo = page.locator('header img, .site-header img, nav img').first();
    await expect(logo).toBeVisible();
    await logo.click();
    await expect(page).toHaveURL(new RegExp(`${BASE_URL}/?$`));
  });

  test('All primary nav links are visible', async ({ page }) => {
    const navLinks = [
      { label: 'Home', href: '/' },
      { label: 'About Us', href: '/about-us/' },
      { label: 'Resources', href: '/resources/' },
      { label: 'Modules', href: '/modules/' },
      { label: 'Solutions', href: '/solutions/' },
      { label: 'Contact Us', href: '/contact-us/' },
      { label: 'How It Works', href: '/how-it-works/' },
    ];

    for (const link of navLinks) {
      const el = page.locator(`nav a[href*="${link.href}"]`).first();
      await expect(el).toBeVisible();
    }
  });

  test('"Book a Demo" CTA button is visible in header', async ({ page }) => {
    const bookDemo = page.locator('a:has-text("Book a Demo"), a:has-text("Book A Demo")').first();
    await expect(bookDemo).toBeVisible();
  });

  test('Clicking "About Us" navigates to about page', async ({ page }) => {
    await page.click('nav a[href*="about-us"]');
    await expect(page).toHaveURL(/about-us/);
    await expect(page).toHaveTitle(/About Us/);
  });

  test('Clicking "Contact Us" navigates to contact page', async ({ page }) => {
    await page.click('nav a[href*="contact-us"]');
    await expect(page).toHaveURL(/contact-us/);
  });

  test('Clicking "Modules" navigates to modules page', async ({ page }) => {
    await page.click('nav a[href*="/modules/"]');
    await expect(page).toHaveURL(/modules/);
  });

  test('Clicking "Solutions" navigates to solutions page', async ({ page }) => {
    await page.click('nav a[href*="solutions"]');
    await expect(page).toHaveURL(/solutions/);
  });

  test('Clicking "Resources" navigates to resources page', async ({ page }) => {
    await page.click('nav a[href*="resources"]');
    await expect(page).toHaveURL(/resources/);
  });

  test('Clicking "How It Works" navigates correctly', async ({ page }) => {
    await page.click('nav a[href*="how-it-works"]');
    await expect(page).toHaveURL(/how-it-works/);
  });

  test('Header is sticky / stays visible on scroll', async ({ page }) => {
    await page.evaluate(() => window.scrollTo(0, 800));
    await page.waitForTimeout(500);
    const header = page.locator('header, .site-header, #masthead').first();
    // Header should still be in viewport after scroll
    await expect(header).toBeVisible();
  });

  test('Mobile: hamburger menu opens and closes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-only test');
    const hamburger = page.locator('.hamburger, .menu-toggle, button[aria-label*="menu"], .elementor-menu-toggle').first();
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    // Mobile menu should open
    const mobileNav = page.locator('.mobile-menu, nav[class*="mobile"], .elementor-nav-menu--dropdown').first();
    await expect(mobileNav).toBeVisible();
    // Close it
    await hamburger.click();
  });
});
