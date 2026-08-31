import { defineConfig, devices } from '@playwright/test';
import type { ReporterDescription } from '@playwright/test';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const isCI = Boolean(process.env.CI);
const isBenchmark = process.env.BENCHMARK === 'true';

// The build bakes the deployment base path into every URL, so the preview server has to be
// addressed below the same prefix. Specs go through sitePath() rather than baseURL, which drops
// the prefix on any path starting with a slash.
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
  // Below the CI job timeout, so an overrun ends in a Playwright report naming the slow specs.
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
    { name: 'mobile-safari', use: { ...devices['iPhone 14'] } }
  ],
  webServer: {
    // CI runs against the artifact the deploy job publishes, so it never rebuilds. Locally the
    // build is part of the command, otherwise the specs would measure a stale dist/.
    command: isCI
      ? 'pnpm run preview --host 127.0.0.1'
      : 'pnpm run build && pnpm run preview --host 127.0.0.1',
    url: `${origin}${basePath ? `/${basePath}` : ''}/`,
    reuseExistingServer: !isCI,
    timeout: 180_000
  }
});
