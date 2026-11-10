import { Page, expect } from '@playwright/test';

export const EMAIL = process.env.TYK_EMAIL ?? '';
export const PASSWORD = process.env.TYK_PASSWORD ?? '';

export async function goToLogin(page: Page) {
  await page.goto('/');
  await page.getByRole('link', { name: 'Sign in' }).first().click();
  await expect(page).toHaveURL(/\/login/);
}

export async function submitLogin(page: Page, email: string, password: string) {
  await page.getByLabel(/email/i).fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole('button', { name: /sign in|log in/i }).click();
}
