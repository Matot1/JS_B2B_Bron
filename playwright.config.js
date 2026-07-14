import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  projects: [
    {
      name: 'edge',
      use: {
        browserName: 'chromium',
        channel: 'msedge',
        baseURL: 'https://b2b.fstravel.com',
        headless: false,
        slowMo: 1200,
      },
    },
    {
      name: 'ci',
      use: {
        browserName: 'firefox',
        baseURL: 'https://b2b.fstravel.com',
        headless: true,
      },
    },
  ],
});
