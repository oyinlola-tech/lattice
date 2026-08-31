/**
 * @lattice/observability — Span Context
 *
 * Factory for creating span context identifiers.
 */

import type { SpanContext } from "../../types.js";

/** Generates a random hex ID. */
function generateHexId(byteLength: number): string {
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Creates a new span context with random IDs. */
export function createSpanContext(options?: {
  readonly traceId?: string;
  readonly spanId?: string;
  readonly parentSpanId?: string;
  readonly traceFlags?: number;
}): SpanContext {
  return {
    traceId: options?.traceId ?? generateHexId(16),
    spanId: options?.spanId ?? generateHexId(8),
    parentSpanId: options?.parentSpanId,
    traceFlags: options?.traceFlags,
  };
}

/** Creates a child span context from a parent. */
export function createChildSpanContext(parent: SpanContext): SpanContext {
  return createSpanContext({
    traceId: parent.traceId,
    parentSpanId: parent.spanId,
  });
}
