import { test as setup, expect } from '@playwright/test';
import { EMAIL, PASSWORD, goToLogin, submitLogin } from './helpers';

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  setup.skip(!EMAIL || !PASSWORD, 'Set TYK_EMAIL and TYK_PASSWORD');

  await goToLogin(page);
  await submitLogin(page, EMAIL, PASSWORD);

  // Successful login leaves the /login page
  await expect(page).not.toHaveURL(/\/login/, { timeout: 20_000 });
  await page.context().storageState({ path: authFile });
});
