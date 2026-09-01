/**
 * @oyinlola141/lattice-observability — Histogram
 *
 * Distribution of observed values for tracking latencies, sizes, etc.
 * Memory-bounded by keeping only summary statistics.
 */

import type { Histogram } from "../../types.js";

/**
 * In-memory histogram. Tracks count, sum, min, and max of observed values.
 */
export class DefaultHistogram implements Histogram {
  readonly name: string;
  readonly labels?: Record<string, string>;
  private count = 0;
  private sum = 0;
  private min = Infinity;
  private max = -Infinity;

  constructor(name: string, labels?: Record<string, string>) {
    this.name = name;
    this.labels = labels;
  }

  record(value: number): void {
    this.count++;
    this.sum += value;
    if (value < this.min) this.min = value;
    if (value > this.max) this.max = value;
  }

  getValue(): {
    readonly count: number;
    readonly sum: number;
    readonly min: number;
    readonly max: number;
  } {
    return {
      count: this.count,
      sum: this.sum,
      min: this.count === 0 ? 0 : this.min,
      max: this.count === 0 ? 0 : this.max,
    };
  }

  reset(): void {
    this.count = 0;
    this.sum = 0;
    this.min = Infinity;
    this.max = -Infinity;
  }
}

/** Creates a histogram. */
export function createHistogram(
  name: string,
  labels?: Record<string, string>,
): DefaultHistogram {
  return new DefaultHistogram(name, labels);
}
