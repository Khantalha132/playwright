import { Page, Locator, expect } from '@playwright/test';

declare const process: {
  env: Record<string, string | undefined>;
};

export const EMAIL = process.env.TYK_EMAIL || 'Fahad+987*@yopmail.com';
export const PASSWORD = process.env.TYK_PASSWORD || 'Talha229@@';

export function emailField(page: Page): Locator {
  return page
    .getByLabel(/e-?mail|username/i)
    .or(page.getByPlaceholder(/e-?mail|username/i))
    .or(page.locator('input[type="email"], input[name*="email" i], input[id*="email" i], input[autocomplete="username"]'))
    .or(page.getByRole('textbox').first())
    .first();
}

export function passwordField(page: Page): Locator {
  return page
    .locator('input[type="password"]')
    .or(page.getByPlaceholder(/password/i))
    .first();
}

export function signInButton(page: Page): Locator {
  return page.getByRole('button', { name: /sign in|log in|login|continue|submit/i }).first();
}

export async function goToLogin(page: Page) {
  await page.goto('/login');
  await expect(page).toHaveURL(/\/login/);
  await expect(emailField(page)).toBeVisible({ timeout: 15_000 });
}

export async function submitLogin(page: Page, email: string, password: string) {
  await emailField(page).fill(email);
  await passwordField(page).fill(password);
  await signInButton(page).click();
}