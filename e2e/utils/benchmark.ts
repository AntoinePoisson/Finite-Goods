import type { TestInfo } from '@playwright/test';

export interface BenchmarkMeasure {
  name: string;
  unit: string;
  value: number;
  /** Whether a lower value is an improvement. Picks the github-action-benchmark tool. */
  direction: 'smaller' | 'bigger';
}

/**
 * Records one measurement for the benchmark reporter. Attachments are the only channel a spec
 * has to a reporter, so the payload travels as JSON under a `benchmark:` prefix.
 */
export async function attachBenchmark(testInfo: TestInfo, measure: BenchmarkMeasure) {
  await testInfo.attach(`benchmark:${measure.name}`, {
    contentType: 'application/json',
    body: Buffer.from(JSON.stringify(measure))
  });
}
