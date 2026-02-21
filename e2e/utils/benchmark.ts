import type { TestInfo } from '@playwright/test';

export interface BenchmarkMeasure {
  name: string;
  unit: string;
  value: number;
  /** lower is better vs higher is better */
  direction: 'smaller' | 'bigger';
}

// reporter reads these attachments, kinda awkward but it works
export async function attachBenchmark(testInfo: TestInfo, measure: BenchmarkMeasure) {
  await testInfo.attach(`benchmark:${measure.name}`, {
    contentType: 'application/json',
    body: Buffer.from(JSON.stringify(measure))
  });
}
