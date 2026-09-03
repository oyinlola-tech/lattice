/**
 * @zudo/lifecycle/context
 *
 * Lifecycle context — passed to component hooks during phase execution.
 */

import type { LifecyclePhase } from "@zudo/constants";

/**
 * Context passed to lifecycle component hooks.
 * Provides cancellation, metadata, and phase information.
 */
export interface LifecycleContext {
  /** AbortSignal for cancelling long-running operations. */
  readonly signal: AbortSignal;

  /** The current lifecycle phase. */
  readonly phase: LifecyclePhase;

  /** Timestamp when the lifecycle started. */
  readonly startedAt: number;

  /** Arbitrary metadata for the current operation. */
  readonly metadata: ReadonlyMap<string, unknown>;
}

/** Creates a lifecycle context. */
export function createLifecycleContext(
  phase: LifecyclePhase,
  startedAt: number,
  signal?: AbortSignal,
  metadata?: Record<string, unknown>,
): LifecycleContext {
  return {
    signal: signal ?? new AbortController().signal,
    phase,
    startedAt,
    metadata: new Map(Object.entries(metadata ?? {})),
  };
}
