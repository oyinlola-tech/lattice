/**
 * @oyinlola141/lattice-observability — Span
 *
 * In-memory span that records attributes, events, status, and errors.
 * Exported as a ReadableSpan when ended.
 */

import type {
  ReadableSpan,
  Span,
  SpanContext,
  SpanEvent,
  SpanOptions,
} from "../../types.js";
import { SpanKind, SpanStatus } from "../../types.js";
import {
  createSpanContext,
  createChildSpanContext,
} from "./spanContext.type.js";

/**
 * Default span implementation.
 * Records attributes, events, errors, and timing until end() is called.
 */
export class DefaultSpan implements Span {
  readonly name: string;
  readonly context: SpanContext;
  readonly startTime: Date;
  readonly kind: SpanKind;

  private attributes: Record<string, unknown> = {};
  private events: SpanEvent[] = [];
  private status: SpanStatus = SpanStatus.UNSET;
  private statusMessage?: string;
  private endTime?: Date;
  private ended = false;
  private resource: Record<string, unknown>;

  constructor(
    name: string,
    context: SpanContext,
    options?: SpanOptions & { readonly resource?: Record<string, unknown> },
  ) {
    this.name = name;
    this.context = context;
    this.kind = options?.kind ?? SpanKind.INTERNAL;
    this.startTime = new Date();
    this.resource = { ...(options?.resource ?? {}) };

    if (options?.attributes) {
      for (const [key, value] of Object.entries(options.attributes)) {
        this.attributes[key] = value;
      }
    }
  }

  setAttribute(key: string, value: unknown): void {
    if (this.ended) return;
    this.attributes[key] = value;
  }

  addEvent(name: string, attributes?: Record<string, unknown>): void {
    if (this.ended) return;
    this.events.push({
      name,
      timestamp: new Date(),
      attributes,
    });
  }

  setStatus(status: SpanStatus, message?: string): void {
    if (this.ended) return;
    this.status = status;
    this.statusMessage = message;
  }

  recordError(error: Error): void {
    if (this.ended) return;
    this.status = SpanStatus.ERROR;
    this.statusMessage = error.message;
    this.addEvent("exception", {
      "exception.type": error.name,
      "exception.message": error.message,
      "exception.stacktrace": error.stack,
    });
  }

  end(): void {
    if (this.ended) return;
    this.ended = true;
    this.endTime = new Date();
  }

  getDuration(): number {
    if (!this.endTime) return Date.now() - this.startTime.getTime();
    return this.endTime.getTime() - this.startTime.getTime();
  }

  isRecording(): boolean {
    return !this.ended;
  }

  /** Exports the span as a ReadableSpan. */
  toReadableSpan(): ReadableSpan {
    return {
      name: this.name,
      context: this.context,
      kind: this.kind,
      startTime: this.startTime,
      endTime: this.endTime ?? new Date(),
      duration: this.getDuration(),
      status: this.status,
      attributes: { ...this.attributes },
      events: [...this.events],
      resource: { ...this.resource },
    };
  }
}

/** Creates a new span. */
export function createSpan(
  name: string,
  options?: SpanOptions & { readonly resource?: Record<string, unknown> },
): DefaultSpan {
  const context = options?.parent
    ? createChildSpanContext(options.parent)
    : createSpanContext();
  return new DefaultSpan(name, context, options);
}
