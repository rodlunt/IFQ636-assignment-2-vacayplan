const { defineConfig, devices } = require('@playwright/test');

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000';

module.exports = defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? [['html'], ['github']] : 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    // WebKit deferred: requires `sudo yarn playwright install-deps webkit`
    // for system libs (libevent-2.1-7t64, libgstreamer-plugins-bad1.0-0,
    // libflite1, libavif16, libwoff1). Uncomment after running that command.
    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },
    {
      name: 'mobile-chromium',
      use: { ...devices['iPhone 13'] },
      testMatch: /responsive\/.*\.spec\.(js|ts)/,
    },
    {
      name: 'tablet-chromium',
      use: { ...devices['iPad Pro'] },
      testMatch: /responsive\/.*\.spec\.(js|ts)/,
    },
  ],
});
