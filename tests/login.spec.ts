import { test, expect } from '@playwright/test';
import { getLoginConfig, loginToApp } from './loginHelper';

const { url, username, password, successUrl, successSelector } = getLoginConfig();

test.describe('Universal login', () => {
  test('logs in with valid credentials', async ({ page }, testInfo) => {
    test.skip(!username || !password, 'Set LOGIN_USERNAME and LOGIN_PASSWORD in .env');

    const result = await loginToApp(page, {
      url,
      username,
      password,
      successUrl,
      successSelector,
      screenshotPath: testInfo.outputPath('login-failure.png'),
    });

    expect(result.success, result.errorMessage).toBe(true);

    await testInfo.attach('after-login', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png',
    });
  });

  // Opt-in so repeated runs do not trip account lockouts: RUN_NEGATIVE_LOGIN=true
  test('rejects an invalid password', async ({ page }) => {
    test.skip(!username, 'Set LOGIN_USERNAME in .env');
    test.skip(process.env.RUN_NEGATIVE_LOGIN !== 'true', 'Set RUN_NEGATIVE_LOGIN=true to run');

    const result = await loginToApp(page, {
      url,
      username,
      password: 'Definitely-Wrong-Password-123!',
      throwOnFailure: false,
    });

    expect(result.success).toBe(false);
  });
});