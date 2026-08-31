/**
 * Observability helpers for authorization events and metrics.
 *
 * @module observability/observability
 */

import type { PermissionDecision } from "../permissionTypes/index.js";

/** Event emitted when a permission check completes. */
export interface PermissionCheckEvent {
  /** Actor ID. */
  readonly actorId: string;
  /** Permission checked. */
  readonly permission: string;
  /** Resource type (if available). */
  readonly resourceType?: string;
  /** Whether allowed. */
  readonly allowed: boolean;
  /** Decision reason. */
  readonly reason?: string;
  /** Evaluation duration in ms. */
  readonly durationMs: number;
}

/** Handler for permission events. */
export type PermissionEventHandler = (event: PermissionCheckEvent) => void;

/**
 * Create a permission event emitter.
 */
export function createPermissionEventEmitter() {
  const handlers = new Set<PermissionEventHandler>();

  return {
    /** Register an event handler. */
    on(handler: PermissionEventHandler): () => void {
      handlers.add(handler);
      return () => { handlers.delete(handler); };
    },

    /** Emit a permission check event. */
    emit(event: PermissionCheckEvent): void {
      for (const handler of handlers) {
        try {
          handler(event);
        } catch {
          // Swallow handler errors to prevent breaking authorization
        }
      }
    },
  };
}

/**
 * Wrap a permission check with observability.
 *
 * @param emitter - The event emitter.
 * @param fn - The permission check function.
 * @returns Wrapped function that emits events.
 */
export function withObservability<T extends (...args: readonly unknown[]) => Promise<PermissionDecision>>(
  emitter: ReturnType<typeof createPermissionEventEmitter>,
  fn: T,
): T {
  return (async (...args: readonly unknown[]) => {
    const start = performance.now();
    const decision = await fn(...args);
    const durationMs = performance.now() - start;

    emitter.emit({
      actorId: (args[0] as { readonly id: string })?.id ?? "unknown",
      permission: (args[1] as string) ?? "unknown",
      allowed: decision.allowed,
      reason: decision.reason,
      durationMs,
    });

    return decision;
  }) as T;
}
