import { test as setup, expect } from '@playwright/test';
import { EMAIL, PASSWORD, goToLogin, submitLogin } from './helpers';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  if (!EMAIL || !PASSWORD) {
    throw new Error('Credentials are empty. Check .env or helpers.ts');
  }

  await goToLogin(page);
  await submitLogin(page, EMAIL, PASSWORD);

  // Fail with a clear message if the site shows an error instead of logging in
  await expect(page, 'Still on /login: credentials rejected?').not.toHaveURL(/\/login/, {
    timeout: 20_000,
  });

  await page.context().storageState({ path: authFile });
});