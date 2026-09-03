/**
 * @zudoliblib/observability — Noop Implementations
 *
 * No-op implementations that discard all telemetry.
 * Allows instrumentation code to remain simple without null checks.
 */

import type {
  Counter,
  Gauge,
  Histogram,
  Logger,
  MetricsRegistry,
  MetricSnapshot,
  Observability,
  PropagationContext,
  PropagationManager,
  Span,
  SpanContext,
  SpanOptions,
  Tracer,
} from "../types.js";
import { LogLevel } from "../types.js";

/* ─── Noop Logger ─────────────────────────────────────────────────────── */

const noopLogger: Logger = {
  name: "noop",
  level: LogLevel.OFF,
  trace: () => {},
  debug: () => {},
  info: () => {},
  warn: () => {},
  error: () => {},
  fatal: () => {},
  child: () => noopLogger,
  isLevelEnabled: () => false,
  flush: async () => {},
};

/* ─── Noop Counter ────────────────────────────────────────────────────── */

const noopCounter: Counter = {
  name: "noop",
  increment: () => {},
  getValue: () => 0,
  reset: () => {},
};

/* ─── Noop Gauge ──────────────────────────────────────────────────────── */

const noopGauge: Gauge = {
  name: "noop",
  setValue: () => {},
  increment: () => {},
  decrement: () => {},
  getValue: () => 0,
  reset: () => {},
};

/* ─── Noop Histogram ──────────────────────────────────────────────────── */

const noopHistogram: Histogram = {
  name: "noop",
  record: () => {},
  getValue: () => ({ count: 0, sum: 0, min: 0, max: 0 }),
  reset: () => {},
};

/* ─── Noop Metrics Registry ───────────────────────────────────────────── */

const noopMetricsRegistry: MetricsRegistry = {
  counter: () => noopCounter,
  gauge: () => noopGauge,
  histogram: () => noopHistogram,
  getCounter: () => undefined,
  getGauge: () => undefined,
  getHistogram: () => undefined,
  getAll: () => [],
  reset: () => {},
};

/* ─── Noop Span ───────────────────────────────────────────────────────── */

const noopSpan: Span = {
  name: "noop",
  context: { traceId: "", spanId: "" },
  startTime: new Date(),
  setAttribute: () => {},
  addEvent: () => {},
  setStatus: () => {},
  recordError: () => {},
  end: () => {},
  getDuration: () => 0,
  isRecording: () => false,
};

/* ─── Noop Tracer ─────────────────────────────────────────────────────── */

const noopTracer: Tracer = {
  startSpan: () => noopSpan,
};

/* ─── Noop Propagation Manager ────────────────────────────────────────── */

const noopContext: PropagationContext = {
  traceId: "",
  spanId: "",
};

const noopPropagationManager: PropagationManager = {
  current: () => noopContext,
  run: async (_ctx, fn) => fn(),
  derive: () => noopContext,
};

/* ─── Noop Observability ──────────────────────────────────────────────── */

/**
 * No-op observability that discards all telemetry.
 * Use when observability is disabled to avoid null checks in instrumented code.
 */
export class NoopObservability implements Observability {
  readonly logger: Logger = noopLogger;
  readonly metrics: MetricsRegistry = noopMetricsRegistry;
  readonly tracer: Tracer = noopTracer;
  readonly propagation: PropagationManager = noopPropagationManager;

  resource(): Observability {
    return this;
  }

  async shutdown(): Promise<void> {}
}

/** Creates a noop observability instance. */
export function createNoopObservability(): NoopObservability {
  return new NoopObservability();
}

export {
  noopLogger,
  noopCounter,
  noopGauge,
  noopHistogram,
  noopMetricsRegistry,
  noopSpan,
  noopTracer,
  noopPropagationManager,
};
