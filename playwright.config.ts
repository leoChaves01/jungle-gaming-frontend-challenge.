import { defineConfig, devices } from '@playwright/test';
const deployedURL = process.env.TEST_BASE_URL;
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 2,
  timeout: 45000,
  expect: { timeout: 10000, toHaveScreenshot: { maxDiffPixelRatio: 0.01 } },
  outputDir: deployedURL ? 'test-results-public' : 'test-results',
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: deployedURL ? 'reports/public-playwright' : 'playwright-report',
      },
    ],
    ['json', { outputFile: deployedURL ? 'reports/public-e2e.json' : 'reports/e2e.json' }],
  ],
  use: {
    baseURL: deployedURL || 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 390, height: 844 },
        isMobile: true,
        hasTouch: true,
      },
    },
  ],
  webServer: deployedURL
    ? undefined
    : {
        command: 'npm run preview',
        port: 4173,
        reuseExistingServer: !process.env.CI,
      },
});
