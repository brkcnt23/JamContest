import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 30000,
  retries: 1,
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:5173',
    screenshot: 'only-on-failure',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } },
    { name: 'firefox', use: { browserName: 'firefox' } },
  ],
  webServer: [
    {
      command: 'pnpm --filter backend run start:dev',
      port: 8000,
      env: {
        DATABASE_URL: 'postgresql://contest:contest@localhost:5433/contest_db?schema=public',
        JWT_SECRET: 'test-secret',
        PORT: '8000',
        NODE_ENV: 'test',
        FRONTEND_URL: 'http://localhost:5173',
      },
      reuseExistingServer: true,
    },
    {
      command: 'pnpm --filter frontend run dev',
      port: 5173,
      reuseExistingServer: true,
    },
  ],
});
