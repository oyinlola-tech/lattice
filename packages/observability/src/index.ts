/**
 * @lattice/observability
 *
 * Structured logging, metrics, tracing, context propagation, and
 * telemetry exporters for the Lattice framework.
 *
 * Provides the instrumentation and abstraction layer without coupling
 * to any specific telemetry provider. Exporters for OpenTelemetry,
 * Prometheus, Datadog, etc. can be added as separate packages.
 *
 * ## Usage
 *
 * ```typescript
 * import { createObservability, LogLevel } from "@lattice/observability";
 *
 * const obs = createObservability({
 *   serviceName: "my-api",
 *   logLevel: LogLevel.INFO,
 * });
 *
 * obs.logger.info("Server started", { port: 3000 });
 * obs.metrics.counter("http.requests.total").increment();
 * const span = obs.tracer.startSpan("handle-request");
 * span.end();
 * ```
 *
 * @packageDocumentation
 */

/* ─── Core Types ────────────────────────────────────────────────────────── */

export {
  LogLevel,
  SpanStatus,
  SpanKind,
  type LogLevelName,
  type LogRecord,
  type Logger,
  type LoggerOptions,
  type LogTransport,
  type PropagationContext,
  type PropagationContextOptions,
  type PropagationManager,
  type Counter,
  type Gauge,
  type Histogram,
  type MetricsRegistry,
  type MetricSnapshot,
  type Span,
  type SpanContext,
  type SpanEvent,
  type SpanOptions,
  type Tracer,
  type ReadableSpan,
  type SpanExporter,
  type LogExporter,
  type MetricExporter,
  type SpanProcessor,
  type SamplingResult,
  type Sampler,
  type RedactionConfig,
  type Observability,
  type ObservabilityConfig,
} from "./types.js";

/* ─── Log Level ─────────────────────────────────────────────────────────── */

export {
  logLevelToName,
  logLevelFromName,
  shouldLog,
  getLogLevelNames,
} from "./logLevel/index.js";

/* ─── Log Record ────────────────────────────────────────────────────────── */

export { createLogRecord, createErrorLogRecord } from "./logRecord/index.js";

/* ─── Logger ────────────────────────────────────────────────────────────── */

export { StructuredLogger, createStructuredLogger } from "./logger/index.js";

/* ─── Propagation ───────────────────────────────────────────────────────── */

export {
  createPropagationContext,
  derivePropagationContext,
  getCurrentContext,
  AsyncPropagationManager,
  createPropagationManager,
} from "./propagation/index.js";

/* ─── Metrics ───────────────────────────────────────────────────────────── */

export {
  DefaultCounter,
  createCounter,
  DefaultGauge,
  createGauge,
  DefaultHistogram,
  createHistogram,
  DefaultMetricsRegistry,
  createMetricsRegistry,
} from "./metrics/index.js";

/* ─── Tracing ───────────────────────────────────────────────────────────── */

export {
  DefaultSpan,
  createSpan,
  createSpanContext,
  createChildSpanContext,
  DefaultTracer,
  createTracer,
} from "./tracing/index.js";

/* ─── Sampling ──────────────────────────────────────────────────────────── */

export {
  AlwaysOnSampler,
  AlwaysOffSampler,
  ProbabilitySampler,
  ParentBasedSampler,
  createAlwaysOnSampler,
  createAlwaysOffSampler,
  createProbabilitySampler,
  createParentBasedSampler,
} from "./sampling/index.js";

/* ─── Exporters ─────────────────────────────────────────────────────────── */

export {
  ConsoleSpanExporter,
  ConsoleLogExporter,
  ConsoleMetricExporter,
  createConsoleSpanExporter,
  createConsoleLogExporter,
  createConsoleMetricExporter,
} from "./exporter/index.js";

/* ─── Processor ─────────────────────────────────────────────────────────── */

export { BatchSpanProcessor, createBatchSpanProcessor } from "./processor/index.js";

/* ─── Redaction ─────────────────────────────────────────────────────────── */

export { createRedactor, redactObject, isSensitiveField } from "./redaction/index.js";

/* ─── Noop ──────────────────────────────────────────────────────────────── */

export {
  NoopObservability,
  createNoopObservability,
  noopLogger,
  noopCounter,
  noopGauge,
  noopHistogram,
  noopMetricsRegistry,
  noopSpan,
  noopTracer,
  noopPropagationManager,
} from "./noop/index.js";

/* ─── Observability Facade ──────────────────────────────────────────────── */

export { DefaultObservability, createObservability } from "./observability/index.js";
