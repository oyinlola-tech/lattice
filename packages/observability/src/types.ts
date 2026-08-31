/**
 * @lattice/observability — Core Types
 *
 * All shared interfaces, enums, and type aliases for the observability package.
 */

/* ─── Log Levels ────────────────────────────────────────────────────────── */

/** Numeric log level hierarchy. Lower = more severe. */
export enum LogLevel {
  TRACE = 0,
  DEBUG = 1,
  INFO = 2,
  WARN = 3,
  ERROR = 4,
  FATAL = 5,
  OFF = 6,
}

/** Human-readable log level name. */
export type LogLevelName = "trace" | "debug" | "info" | "warn" | "error" | "fatal" | "off";

/* ─── Log Records ───────────────────────────────────────────────────────── */

/** A structured log record produced by a logger. */
export interface LogRecord {
  readonly level: LogLevel;
  readonly levelName: LogLevelName;
  readonly message: string;
  readonly timestamp: Date;
  readonly loggerName: string;
  readonly context?: Record<string, unknown>;
  readonly error?: {
    readonly name: string;
    readonly message: string;
    readonly stack?: string;
    readonly cause?: unknown;
  };
}

/* ─── Logger ────────────────────────────────────────────────────────────── */

/** Structured logger interface. */
export interface Logger {
  readonly name: string;
  readonly level: LogLevel;

  trace(message: string, context?: Record<string, unknown>): void;
  debug(message: string, context?: Record<string, unknown>): void;
  info(message: string, context?: Record<string, unknown>): void;
  warn(message: string, context?: Record<string, unknown>): void;
  error(message: string, context?: Record<string, unknown>): void;
  fatal(message: string, context?: Record<string, unknown>): void;

  /** Creates a child logger with persistent context. */
  child(name: string, context?: Record<string, unknown>): Logger;

  /** Checks if a level would be logged. */
  isLevelEnabled(level: LogLevel): boolean;

  /** Flushes any buffered log records. */
  flush(): Promise<void>;
}

/** Options for creating a logger. */
export interface LoggerOptions {
  readonly name: string;
  readonly level?: LogLevel;
  readonly context?: Record<string, unknown>;
  readonly transport?: LogTransport;
}

/** A log transport writes records to a destination. */
export interface LogTransport {
  readonly name: string;
  write(record: LogRecord): void | Promise<void>;
}

/* ─── Propagation Context ───────────────────────────────────────────────── */

/** Distributed tracing context carried through execution. */
export interface PropagationContext {
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly userId?: string;
  readonly service?: string;
  readonly baggage?: Record<string, string>;
}

/** Options for creating a propagation context. */
export interface PropagationContextOptions {
  readonly traceId?: string;
  readonly spanId?: string;
  readonly parentSpanId?: string;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly userId?: string;
  readonly service?: string;
  readonly baggage?: Record<string, string>;
}

/* ─── Metrics ───────────────────────────────────────────────────────────── */

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

/* ─── Tracing ───────────────────────────────────────────────────────────── */

/** Status of a span. */
export enum SpanStatus {
  UNSET = "UNSET",
  OK = "OK",
  ERROR = "ERROR",
}

/** A span event (timestamped annotation). */
export interface SpanEvent {
  readonly name: string;
  readonly timestamp: Date;
  readonly attributes?: Record<string, unknown>;
}

/** Context identifying a specific span within a trace. */
export interface SpanContext {
  readonly traceId: string;
  readonly spanId: string;
  readonly parentSpanId?: string;
  readonly traceFlags?: number;
}

/** A single unit of work within a distributed trace. */
export interface Span {
  readonly name: string;
  readonly context: SpanContext;
  readonly startTime: Date;

  setAttribute(key: string, value: unknown): void;
  addEvent(name: string, attributes?: Record<string, unknown>): void;
  setStatus(status: SpanStatus, message?: string): void;
  recordError(error: Error): void;
  end(): void;
  getDuration(): number;
  isRecording(): boolean;
}

/** Creates new spans. */
export interface Tracer {
  startSpan(name: string, options?: SpanOptions): Span;
}

/** Options for starting a span. */
export interface SpanOptions {
  readonly parent?: SpanContext;
  readonly attributes?: Record<string, unknown>;
  readonly kind?: SpanKind;
}

/** Semantic kind of a span. */
export enum SpanKind {
  INTERNAL = "INTERNAL",
  SERVER = "SERVER",
  CLIENT = "CLIENT",
  PRODUCER = "PRODUCER",
  CONSUMER = "CONSUMER",
}

/* ─── Sampling ──────────────────────────────────────────────────────────── */

/** Decision on whether a span should be recorded. */
export interface SamplingResult {
  readonly decision: "RECORD_AND_SAMPLE" | "RECORD_ONLY" | "DO_NOT_RECORD";
  readonly attributes?: Record<string, unknown>;
}

/** Determines which traces to sample. */
export interface Sampler {
  shouldSample(parentContext?: SpanContext, traceId?: string): SamplingResult;
}

/* ─── Exporters ─────────────────────────────────────────────────────────── */

/** Exports completed spans to a backend. */
export interface SpanExporter {
  export(spans: readonly ReadableSpan[]): Promise<void>;
  shutdown(): Promise<void>;
}

/** A span that has been completed and is ready for export. */
export interface ReadableSpan {
  readonly name: string;
  readonly context: SpanContext;
  readonly kind: SpanKind;
  readonly startTime: Date;
  readonly endTime: Date;
  readonly duration: number;
  readonly status: SpanStatus;
  readonly attributes: Record<string, unknown>;
  readonly events: readonly SpanEvent[];
  readonly resource: Record<string, unknown>;
}

/** Exports log records to a backend. */
export interface LogExporter {
  export(records: readonly LogRecord[]): Promise<void>;
  shutdown(): Promise<void>;
}

/** Exports metric snapshots to a backend. */
export interface MetricExporter {
  export(snapshots: readonly MetricSnapshot[]): Promise<void>;
  shutdown(): Promise<void>;
}

/* ─── Processor ─────────────────────────────────────────────────────────── */

/** Processes spans before export (batching, filtering, enrichment). */
export interface SpanProcessor {
  onStart(span: Span): void;
  onEnd(span: ReadableSpan): void;
  shutdown(): Promise<void>;
}

/* ─── Redaction ─────────────────────────────────────────────────────────── */

/** Configuration for redacting sensitive fields from logs and traces. */
export interface RedactionConfig {
  /** Field names to redact (case-insensitive). */
  readonly fields: readonly string[];
  /** Custom redaction function. */
  readonly customRedactor?: (key: string, value: unknown) => unknown;
  /** Replacement text. */
  readonly replacement?: string;
}

/* ─── Observability ─────────────────────────────────────────────────────── */

/** Central observability facade. */
export interface Observability {
  readonly logger: Logger;
  readonly metrics: MetricsRegistry;
  readonly tracer: Tracer;
  readonly propagation: PropagationManager;

  /** Creates a scoped observability instance with resource attributes. */
  resource(attributes: Record<string, unknown>): Observability;

  /** Shuts down all exporters and processors. */
  shutdown(): Promise<void>;
}

/** Manages propagation contexts. */
export interface PropagationManager {
  /** Gets the current context (from AsyncLocalStorage). */
  current(): PropagationContext;
  /** Runs a function with a new propagation context. */
  run<T>(context: PropagationContext, fn: () => T | Promise<T>): Promise<T>;
  /** Creates a new context derived from the current one. */
  derive(overrides?: Partial<PropagationContext>): PropagationContext;
}

/* ─── Configuration ─────────────────────────────────────────────────────── */

/** Configuration for the observability system. */
export interface ObservabilityConfig {
  readonly serviceName: string;
  readonly serviceVersion?: string;
  readonly environment?: string;
  readonly logLevel?: LogLevel;
  readonly logExporter?: LogExporter;
  readonly spanExporter?: SpanExporter;
  readonly metricExporter?: MetricExporter;
  readonly sampler?: Sampler;
  readonly processors?: readonly SpanProcessor[];
  readonly redaction?: RedactionConfig;
  readonly resource?: Record<string, unknown>;
}
