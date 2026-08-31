/**
 * Configuration types for the observability package.
 */

import type { LogLevel } from "./logging.types.js";
import type { MetricsRegistry } from "./metrics.types.js";
import type { Logger } from "./logging.types.js";
import type { Tracer, SpanExporter, SpanProcessor, Sampler } from "./tracing.types.js";
import type { LogExporter } from "./logging.types.js";
import type { MetricExporter } from "./metrics.types.js";

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

/** Manages propagation contexts. */
export interface PropagationManager {
  /** Gets the current context (from AsyncLocalStorage). */
  current(): PropagationContext;
  /** Runs a function with a new propagation context. */
  run<T>(context: PropagationContext, fn: () => T | Promise<T>): Promise<T>;
  /** Creates a new context derived from the current one. */
  derive(overrides?: Partial<PropagationContext>): PropagationContext;
}

/** Configuration for redacting sensitive fields from logs and traces. */
export interface RedactionConfig {
  /** Field names to redact (case-insensitive). */
  readonly fields: readonly string[];
  /** Custom redaction function. */
  readonly customRedactor?: (key: string, value: unknown) => unknown;
  /** Replacement text. */
  readonly replacement?: string;
}

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
