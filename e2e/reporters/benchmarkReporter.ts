import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

import type { FullResult, Reporter, TestCase, TestResult } from '@playwright/test/reporter';

import type { BenchmarkMeasure } from '../utils/benchmark';

/** Entry shape github-action-benchmark reads. */
interface BenchmarkEntry {
  name: string;
  unit: string;
  value: number;
  extra?: string;
}

interface Accumulator {
  unit: string;
  direction: BenchmarkMeasure['direction'];
  values: number[];
  source: string;
}

const outputDirectory = 'reports/benchmark';
const attachmentPrefix = 'benchmark:';

function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0 ? (sorted[middle - 1] + sorted[middle]) / 2 : sorted[middle];
}

function standardDeviation(values: number[]) {
  const mean = values.reduce((total, value) => total + value, 0) / values.length;
  return Math.sqrt(values.reduce((total, value) => total + (value - mean) ** 2, 0) / values.length);
}

const round = (value: number) => Math.round(value * 100) / 100;

/**
 * Collects `benchmark:` attachments from passing tests into the two files github-action-benchmark
 * expects. Repeated runs of one metric (--repeat-each) collapse to their median, so a single slow
 * run on a noisy runner does not read as a regression. Enabled with BENCHMARK=true.
 */
class BenchmarkReporter implements Reporter {
  private readonly metrics = new Map<string, Accumulator>();

  onTestEnd(test: TestCase, result: TestResult) {
    // A failed run measures the failure, not the application.
    if (result.status !== 'passed') return;

    for (const attachment of result.attachments) {
      if (!attachment.name.startsWith(attachmentPrefix)) continue;
      if (attachment.contentType !== 'application/json' || !attachment.body) continue;

      let measure: BenchmarkMeasure;
      try {
        measure = JSON.parse(attachment.body.toString('utf-8')) as BenchmarkMeasure;
      } catch {
        continue;
      }
      if (!measure.name || !measure.unit || !measure.direction) continue;
      if (typeof measure.value !== 'number' || !Number.isFinite(measure.value)) continue;

      const existing = this.metrics.get(measure.name);
      if (existing) existing.values.push(measure.value);
      else
        this.metrics.set(measure.name, {
          unit: measure.unit,
          direction: measure.direction,
          values: [measure.value],
          source: `${test.parent.title} / ${test.title}`
        });
    }
  }

  onEnd(_result: FullResult) {
    const smaller: BenchmarkEntry[] = [];
    const bigger: BenchmarkEntry[] = [];

    for (const [name, metric] of this.metrics) {
      const runs = metric.values.length;
      const entry: BenchmarkEntry = {
        name,
        unit: metric.unit,
        value: round(median(metric.values)),
        extra:
          runs > 1
            ? `${metric.source} | median of ${runs} runs [${metric.values.map(round).join(', ')}] σ=${round(standardDeviation(metric.values))}`
            : metric.source
      };
      (metric.direction === 'smaller' ? smaller : bigger).push(entry);
    }

    mkdirSync(resolve(outputDirectory), { recursive: true });
    if (smaller.length > 0) {
      writeFileSync(resolve(outputDirectory, 'benchmark-smaller.json'), JSON.stringify(smaller, null, 2));
    }
    if (bigger.length > 0) {
      writeFileSync(resolve(outputDirectory, 'benchmark-bigger.json'), JSON.stringify(bigger, null, 2));
    }
    console.info(
      `[benchmark] wrote ${smaller.length} smaller-is-better and ${bigger.length} bigger-is-better metrics to ${outputDirectory}/`
    );
  }
}

/** Instantiated by Playwright from config/playwright.ts, never imported by hand. */
export default BenchmarkReporter;
