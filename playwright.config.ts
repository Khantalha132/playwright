import 'dotenv/config';
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,

  use: {
    browserName: 'chromium',
    headless: false,
    screenshot: 'on',
    trace: 'on'
  }
});

  