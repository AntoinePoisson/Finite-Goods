import { defineConfig, devices } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const isCI = Boolean(process.env.CI);
const isBenchmark = process.env.BENCHMARK === 'true';

// same prefix as the build, specs go through sitePath() for this
const basePath = (process.env.PAGES_BASE_PATH ?? '').replace(/^\/+|\/+$/g, '');
const origin = 'http://127.0.0.1:4173';

function reporter(): ReporterDescription[] {
  if (isBenchmark) return [['list'], [resolve(root, 'e2e/reporters/benchmarkReporter.ts')]];
  if (isCI) return [['github'], ['html', { outputFolder: resolve(root, 'reports/html'), open: 'never' }]];
  return [['list']];
}

export default defineConfig({
  testDir: resolve(root, 'e2e'),
  outputDir: resolve(root, 'reports/artifacts'),
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  workers: isCI ? 2 : undefined,
  timeout: isCI ? 60_000 : 30_000,
  // leave some room for the report if a spec hangs
  globalTimeout: isCI ? 25 * 60_000 : undefined,
  reporter: reporter(),
  use: {
    baseURL: origin,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: isCI ? 'retain-on-failure' : 'off'
  },
  expect: { timeout: isCI ? 10_000 : 5_000 },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    // TODO: webkit mobile is slow locally, maybe drop it from the default run
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } }
  ],
  webServer: {
    // CI already has dist/, locally rebuild so we dont test yesterday's build
    command: isCI
      ? 'pnpm run preview --host 127.0.0.1'
      : 'pnpm run build && pnpm run preview --host 127.0.0.1',
    url: `${origin}${basePath ? `/${basePath}` : ''}/`,
    reuseExistingServer: !isCI,
    timeout: 180_000
  }
});
