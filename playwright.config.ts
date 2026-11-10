import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

declare const process: {
  env?: Record<string, string | undefined>;
};

const env = process.env ?? {};

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  retries: env.CI ? 2 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: env.BASE_URL ?? 'https://www.tykstore.com',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Logs in once and saves the session
    { name: 'setup', testMatch: /auth\.setup\.ts/ },

    // Anonymous tests
    {
      name: 'public',
      testMatch: /(public|login)\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] },
    },

    // Logged-in tests reuse the saved session
    {
      name: 'authenticated',
      testMatch: /app\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: 'playwright/.auth/user.json' },
    },

    // Responsive checks
    {
      name: 'mobile',
      testMatch: /public\.spec\.ts/,
      use: { ...devices['Pixel 7'] },
    },
  ],
});
