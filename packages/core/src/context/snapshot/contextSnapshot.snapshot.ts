import type { ExecutionContext } from "../core/executionContext.context.js";
import { ContextValues } from "../values/contextValues.values.js";
import { createContextValues } from "../values/contextValues.values.js";

/**
 * Immutable snapshot of an execution context.
 *
 * A snapshot captures both:
 *
 * 1. The execution metadata
 * 2. The typed context values
 *
 * This allows the context to be restored later, for example
 * when processing a background job or an asynchronous task.
 */
export interface ContextSnapshot {
  /**
   * Execution context captured at snapshot time.
   */
  readonly context: ExecutionContext;

  /**
   * Typed context values captured at snapshot time.
   */
  readonly values: ContextValues;

  /**
   * Time at which the snapshot was created.
   */
  readonly capturedAt: Date;
}

/**
 * Creates a snapshot from an execution context.
 */
export function createContextSnapshot(
  context: ExecutionContext,
  values: ContextValues = createContextValues(),
): ContextSnapshot {
  return Object.freeze({
    context,
    values,
    capturedAt: new Date(),
  });
}

/**
 * Restores an execution context from a snapshot.
 *
 * The returned objects are references to the immutable
 * snapshot state, so no mutable state is shared accidentally.
 */
export function restoreContextSnapshot(
  snapshot: ContextSnapshot,
): {
  readonly context: ExecutionContext;
  readonly values: ContextValues;
} {
  return {
    context: snapshot.context,
    values: new ContextValues(
      snapshot.values.toStore(),
    ),
  };
}

/**
 * Creates a new snapshot derived from an existing snapshot.
 *
 * The original snapshot remains unchanged.
 */
export function deriveContextSnapshot(
  snapshot: ContextSnapshot,
  context: ExecutionContext,
  values?: ContextValues,
): ContextSnapshot {
  return createContextSnapshot(
    context,
    values ??
      new ContextValues(
        snapshot.values.toStore(),
      ),
  );
}