import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './perf',
  testMatch: '*.perf.spec.ts',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  timeout: 15 * 60 * 1000,
  reporter: [['list']],
  outputDir: './test-results/perf-artifacts',
  use: {
    baseURL: 'http://127.0.0.1:5188',
    trace: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        launchOptions: { args: ['--autoplay-policy=no-user-gesture-required'] },
      },
    },
  ],
  webServer: {
    command: 'npm run build && npx remix-serve build/server/index.js',
    url: 'http://127.0.0.1:5188/studio-lab',
    reuseExistingServer: false,
    env: { PORT: '5188' },
    timeout: 300 * 1000,
  },
});
