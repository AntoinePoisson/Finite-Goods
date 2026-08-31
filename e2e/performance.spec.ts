import { expect, test } from '@playwright/test';

import { attachBenchmark } from './utils/benchmark';
import { sitePath } from './utils/site';

/**
 * Timings tracked over time by github-action-benchmark. Nothing here asserts an absolute budget:
 * Lighthouse owns the thresholds, this file owns the trend.
 */
test.describe('performance', () => {
  test('the homepage paints and settles quickly', async ({ page }, testInfo) => {
    await page.goto(sitePath('/'), { waitUntil: 'load' });

    const timings = await page.evaluate(async () => {
      const firstContentfulPaint = await new Promise<number | null>((resolve) => {
        const observer = new PerformanceObserver((list) => {
          const entry = list.getEntriesByName('first-contentful-paint')[0];
          if (entry) {
            observer.disconnect();
            resolve(entry.startTime);
          }
        });
        observer.observe({ type: 'paint', buffered: true });
        // The paint entry is buffered, so this only fires on a browser that never records one.
        setTimeout(() => {
          observer.disconnect();
          resolve(null);
        }, 5000);
      });

      const [navigation] = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
      return { firstContentfulPaint, loadEventEnd: navigation?.loadEventEnd ?? null };
    });

    expect(timings.firstContentfulPaint).not.toBeNull();
    expect(timings.loadEventEnd).not.toBeNull();

    await attachBenchmark(testInfo, {
      name: 'Homepage first contentful paint',
      unit: 'ms',
      value: timings.firstContentfulPaint!,
      direction: 'smaller'
    });
    await attachBenchmark(testInfo, {
      name: 'Homepage load event',
      unit: 'ms',
      value: timings.loadEventEnd!,
      direction: 'smaller'
    });
  });

  test('a reservation round trip stays fast', async ({ page }, testInfo) => {
    await page.goto(sitePath('/back-office'));
    await page.getByRole('button', { name: 'Reset demo' }).click();
    await page.goto(sitePath('/acquire/ordinary-rock'));
    // Every checkout field fills itself from the demo profile once it is hovered or focused.
    for (const label of ['Email address', 'Full name', 'Country', 'Card number', 'Expiry', 'CVC']) {
      await page.getByLabel(label).focus();
    }
    await expect(page.getByLabel('Card number')).toHaveValue('4242 4242 4242 4242');

    // Covers the whole chain the demo relies on: the Go engine compiled to WebAssembly, the
    // worker that hosts it, the Web Lock serializing writers and the IndexedDB round trip.
    const started = performance.now();
    await page.getByRole('button', { name: 'Create demo reservation' }).click();
    await expect(page.getByRole('button', { name: 'Preview Stripe return' })).toBeVisible();
    const elapsed = performance.now() - started;

    await attachBenchmark(testInfo, {
      name: 'Reservation round trip',
      unit: 'ms',
      value: elapsed,
      direction: 'smaller'
    });
  });
});
