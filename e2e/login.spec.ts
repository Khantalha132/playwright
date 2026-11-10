import { test, expect } from '@playwright/test';
import { goToLogin, submitLogin } from './helpers';

test.describe('Login', () => {
  test('login form is displayed', async ({ page }) => {
    await goToLogin(page);
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /sign in|log in/i })).toBeVisible();
  });

  test('rejects invalid credentials', async ({ page }) => {
    await goToLogin(page);
    await submitLogin(page, 'wrong.user@yopmail.com', 'WrongPass123!');

    await expect(
      page.getByRole('alert').or(page.getByText(/invalid|incorrect|failed|not found/i)).first(),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('requires email and password', async ({ page }) => {
    await goToLogin(page);
    await page.getByRole('button', { name: /sign in|log in/i }).click();
    await expect(page).toHaveURL(/\/login/);
  });
});
