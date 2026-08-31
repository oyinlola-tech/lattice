/**
 * Metrics types for the observability package.
 */

/** A monotonically increasing counter. */
export interface Counter {
  readonly name: string;
  increment(value?: number): void;
  getValue(): number;
  reset(): void;
}

/** A value that can go up and down. */
export interface Gauge {
  readonly name: string;
  setValue(value: number): void;
  increment(value?: number): void;
  decrement(value?: number): void;
  getValue(): number;
  reset(): void;
}

/** A distribution of observed values (latencies, sizes, etc.). */
export interface Histogram {
  readonly name: string;
  record(value: number): void;
  getValue(): { readonly count: number; readonly sum: number; readonly min: number; readonly max: number };
  reset(): void;
}

/** Registry for all metrics. */
export interface MetricsRegistry {
  counter(name: string, labels?: Record<string, string>): Counter;
  gauge(name: string, labels?: Record<string, string>): Gauge;
  histogram(name: string, labels?: Record<string, string>): Histogram;
  getCounter(name: string): Counter | undefined;
  getGauge(name: string): Gauge | undefined;
  getHistogram(name: string): Histogram | undefined;
  getAll(): MetricSnapshot[];
  reset(): void;
}

/** A point-in-time snapshot of a metric. */
export interface MetricSnapshot {
  readonly name: string;
  readonly type: "counter" | "gauge" | "histogram";
  readonly value: number | { readonly count: number; readonly sum: number; readonly min: number; readonly max: number };
  readonly labels?: Record<string, string>;
}

/** Exports metric snapshots to a backend. */
export interface MetricExporter {
  export(snapshots: readonly MetricSnapshot[]): Promise<void>;
  shutdown(): Promise<void>;
}
