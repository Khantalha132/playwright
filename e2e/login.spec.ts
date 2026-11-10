import { test, expect } from '@playwright/test';
import { goToLogin, submitLogin, emailField, passwordField, signInButton } from './helpers';

test.describe('Login', () => {
  test('login form is displayed', async ({ page }) => {
    await goToLogin(page);
    await expect(emailField(page)).toBeVisible();
    await expect(passwordField(page)).toBeVisible();
    await expect(signInButton(page)).toBeVisible();
  });

  test('rejects invalid credentials', async ({ page }) => {
    await goToLogin(page);
    await submitLogin(page, 'wrong.user@yopmail.com', 'WrongPass123!');
    await expect(
      page.getByRole('alert').or(page.getByText(/invalid|incorrect|failed|not found/i)).first(),
    ).toBeVisible();
    await expect(page).toHaveURL(/\/login/);
  });

  test('stays on login when submitted empty', async ({ page }) => {
    await goToLogin(page);
    await signInButton(page).click();
    await expect(page).toHaveURL(/\/login/);
  });
});