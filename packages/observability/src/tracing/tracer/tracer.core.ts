/**
 * @zudo/observability — Tracer
 *
 * Creates spans and notifies processors on start/end.
 */

import type {
  ReadableSpan,
  Span,
  SpanExporter,
  SpanOptions,
  SpanProcessor,
  Tracer,
} from "../../types.js";
import { DefaultSpan, createSpan } from "../span/index.js";

/**
 * Default tracer that creates spans and notifies processors on start/end.
 */
export class DefaultTracer implements Tracer {
  private readonly processors: SpanProcessor[];
  private readonly exporter?: SpanExporter;
  private readonly resource: Record<string, unknown>;

  constructor(options?: {
    readonly processors?: readonly SpanProcessor[];
    readonly exporter?: SpanExporter;
    readonly resource?: Record<string, unknown>;
  }) {
    this.processors = [...(options?.processors ?? [])];
    this.exporter = options?.exporter;
    this.resource = { ...(options?.resource ?? {}) };
  }

  startSpan(name: string, options?: SpanOptions): Span {
    const tracer = this;
    const span = createSpan(name, {
      ...options,
      resource: this.resource,
    });

    for (const processor of this.processors) {
      processor.onStart(span);
    }

    return new Proxy(span, {
      get(target, prop) {
        if (prop === "end") {
          return () => {
            target.end();
            for (const processor of tracer.processors) {
              processor.onEnd(target.toReadableSpan());
            }
          };
        }
        return Reflect.get(target, prop);
      },
    });
  }

  /** Exports a completed span directly. */
  async exportSpan(span: ReadableSpan): Promise<void> {
    if (this.exporter) {
      await this.exporter.export([span]);
    }
  }

  /** Shuts down all processors and the exporter. */
  async shutdown(): Promise<void> {
    for (const processor of this.processors) {
      await processor.shutdown();
    }
    if (this.exporter) {
      await this.exporter.shutdown();
    }
  }
}

/** Creates a tracer. */
export function createTracer(options?: {
  readonly processors?: readonly SpanProcessor[];
  readonly exporter?: SpanExporter;
  readonly resource?: Record<string, unknown>;
}): DefaultTracer {
  return new DefaultTracer(options);
}
