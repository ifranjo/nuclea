import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  retries: process.env.CI ? 1 : 0,
  fullyParallel: false,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://localhost:3002',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    reducedMotion: 'reduce',
  },
  projects: [
    {
      name: 'Desktop',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 3002,
    reuseExistingServer: true,
    timeout: 30000,
  },
});
