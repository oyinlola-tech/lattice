/**
 * Tracing types for the observability package.
 */

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

/** Decision on whether a span should be recorded. */
export interface SamplingResult {
  readonly decision: "RECORD_AND_SAMPLE" | "RECORD_ONLY" | "DO_NOT_RECORD";
  readonly attributes?: Record<string, unknown>;
}

/** Determines which traces to sample. */
export interface Sampler {
  shouldSample(parentContext?: SpanContext, traceId?: string): SamplingResult;
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

/** Exports completed spans to a backend. */
export interface SpanExporter {
  export(spans: readonly ReadableSpan[]): Promise<void>;
  shutdown(): Promise<void>;
}

/** Processes spans before export (batching, filtering, enrichment). */
export interface SpanProcessor {
  onStart(span: Span): void;
  onEnd(span: ReadableSpan): void;
  shutdown(): Promise<void>;
}
