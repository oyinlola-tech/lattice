/**
 * @zudo/observability — Propagation
 *
 * Context propagation using AsyncLocalStorage for request-scoped
 * trace, span, request, and correlation IDs.
 */

import { AsyncLocalStorage } from "node:async_hooks";
import { randomUUID } from "node:crypto";
import type {
  PropagationContext,
  PropagationContextOptions,
  PropagationManager,
} from "../types.js";

const storage = new AsyncLocalStorage<PropagationContext>();

/** Generates a random hex ID. */
function generateId(byteLength = 16): string {
  const bytes = new Uint8Array(byteLength);
  for (let i = 0; i < byteLength; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Creates a new propagation context. */
export function createPropagationContext(
  options?: PropagationContextOptions,
): PropagationContext {
  const traceId = options?.traceId ?? generateId(16);
  const spanId = options?.spanId ?? generateId(8);

  return {
    traceId,
    spanId,
    parentSpanId: options?.parentSpanId,
    requestId: options?.requestId,
    correlationId: options?.correlationId,
    userId: options?.userId,
    service: options?.service,
    baggage: options?.baggage
      ? Object.freeze({ ...options.baggage })
      : undefined,
  };
}

/** Derives a child context from a parent. */
export function derivePropagationContext(
  parent: PropagationContext,
  overrides?: Partial<PropagationContextOptions>,
): PropagationContext {
  return createPropagationContext({
    traceId: overrides?.traceId ?? parent.traceId,
    spanId: overrides?.spanId ?? generateId(8),
    parentSpanId: parent.spanId,
    requestId: overrides?.requestId ?? parent.requestId,
    correlationId: overrides?.correlationId ?? parent.correlationId,
    userId: overrides?.userId ?? parent.userId,
    service: overrides?.service ?? parent.service,
    baggage: overrides?.baggage ?? parent.baggage,
  });
}

/** Gets the current propagation context. */
export function getCurrentContext(): PropagationContext {
  return storage.getStore() ?? createPropagationContext();
}

/**
 * PropagationManager implementation using AsyncLocalStorage.
 */
export class AsyncPropagationManager implements PropagationManager {
  current(): PropagationContext {
    return getCurrentContext();
  }

  async run<T>(
    context: PropagationContext,
    fn: () => T | Promise<T>,
  ): Promise<T> {
    return storage.run(context, fn);
  }

  derive(overrides?: Partial<PropagationContextOptions>): PropagationContext {
    const current = this.current();
    return derivePropagationContext(current, overrides);
  }
}

/** Creates a propagation manager. */
export function createPropagationManager(): AsyncPropagationManager {
  return new AsyncPropagationManager();
}
