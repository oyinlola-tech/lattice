/**
 * @zudojs/observability — Metrics Registry
 *
 * Central registry for all metrics. Creates and caches metrics by name+labels.
 */

import type {
  Counter,
  Gauge,
  Histogram,
  MetricsRegistry,
  MetricSnapshot,
} from "../types.js";
import { DefaultCounter } from "./counter/counter.core.js";
import { DefaultGauge } from "./gauge/gauge.core.js";
import { DefaultHistogram } from "./histogram/histogram.core.js";

type MetricEntry =
  | { type: "counter"; metric: DefaultCounter }
  | { type: "gauge"; metric: DefaultGauge }
  | { type: "histogram"; metric: DefaultHistogram };

function metricKey(
  type: string,
  name: string,
  labels?: Record<string, string>,
): string {
  const labelStr = labels
    ? Object.entries(labels)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join(",")
    : "";
  return `${type}:${name}:${labelStr}`;
}

/**
 * In-memory metrics registry. Creates, caches, and manages metrics.
 */
export class DefaultMetricsRegistry implements MetricsRegistry {
  private readonly metrics = new Map<string, MetricEntry>();

  counter(name: string, labels?: Record<string, string>): Counter {
    const key = metricKey("counter", name, labels);
    let entry = this.metrics.get(key);
    if (!entry || entry.type !== "counter") {
      entry = { type: "counter", metric: new DefaultCounter(name, labels) };
      this.metrics.set(key, entry);
    }
    return entry.metric;
  }

  gauge(name: string, labels?: Record<string, string>): Gauge {
    const key = metricKey("gauge", name, labels);
    let entry = this.metrics.get(key);
    if (!entry || entry.type !== "gauge") {
      entry = { type: "gauge", metric: new DefaultGauge(name, labels) };
      this.metrics.set(key, entry);
    }
    return entry.metric;
  }

  histogram(name: string, labels?: Record<string, string>): Histogram {
    const key = metricKey("histogram", name, labels);
    let entry = this.metrics.get(key);
    if (!entry || entry.type !== "histogram") {
      entry = { type: "histogram", metric: new DefaultHistogram(name, labels) };
      this.metrics.set(key, entry);
    }
    return entry.metric;
  }

  getCounter(name: string): Counter | undefined {
    for (const entry of this.metrics.values()) {
      if (entry.type === "counter" && entry.metric.name === name)
        return entry.metric;
    }
    return undefined;
  }

  getGauge(name: string): Gauge | undefined {
    for (const entry of this.metrics.values()) {
      if (entry.type === "gauge" && entry.metric.name === name)
        return entry.metric;
    }
    return undefined;
  }

  getHistogram(name: string): Histogram | undefined {
    for (const entry of this.metrics.values()) {
      if (entry.type === "histogram" && entry.metric.name === name)
        return entry.metric;
    }
    return undefined;
  }

  getAll(): MetricSnapshot[] {
    const snapshots: MetricSnapshot[] = [];
    for (const entry of this.metrics.values()) {
      snapshots.push({
        name: entry.metric.name,
        type: entry.type,
        value: entry.metric.getValue(),
        labels: entry.metric.labels,
      });
    }
    return snapshots;
  }

  reset(): void {
    for (const entry of this.metrics.values()) {
      entry.metric.reset();
    }
  }
}

/** Creates a metrics registry. */
export function createMetricsRegistry(): DefaultMetricsRegistry {
  return new DefaultMetricsRegistry();
}
