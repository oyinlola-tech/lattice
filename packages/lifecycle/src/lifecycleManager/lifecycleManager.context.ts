/**
 * @zudojs/lifecycle/manager/context
 *
 * Internal context shared between startup and shutdown orchestration modules,
 * plus helper functions for component state transitions and event emission.
 */

import { LifecycleState } from "@zudojs/constants";
import type { LifecycleStateMachine } from "../lifecycleState/lifecycleState.machine.js";
import type { LifecycleRegistry } from "../lifecycleRegistry/lifecycleRegistry.core.js";
import type { LifecycleExecutor } from "../lifecycleExecutor/lifecycleExecutor.core.js";
import type { LifecycleEventEmitter } from "../lifecycleEvents/lifecycleEvents.core.js";
import type { ExecutionResult } from "../lifecycleExecutor/lifecycleExecutor.core.js";

/** Internal context passed to startup/shutdown orchestration functions. */
export interface LifecycleManagerContext {
  readonly registry: LifecycleRegistry;
  readonly state: LifecycleStateMachine;
  readonly executor: LifecycleExecutor;
  readonly events: LifecycleEventEmitter;
  readonly concurrency: number;
  readonly shutdownTimeout: number;
  readonly componentStates: Map<string, LifecycleStateMachine>;
  readonly results: Map<string, ExecutionResult[]>;
  startTime: number;
}

/**
 * Safely transitions a component state machine to the target state.
 * No-op if the transition is not valid from the current state.
 */
export function transitionComponent(
  ctx: LifecycleManagerContext,
  id: string,
  targetState: LifecycleState,
): void {
  const sm = ctx.componentStates.get(id);
  if (sm && sm.canTransition(targetState)) {
    sm.transition(targetState);
  }
}

/**
 * Transitions multiple component state machines to the same target state.
 */
export function transitionComponentBatch(
  ctx: LifecycleManagerContext,
  ids: readonly string[],
  targetState: LifecycleState,
): void {
  for (const id of ids) {
    transitionComponent(ctx, id, targetState);
  }
}

/**
 * Emits a component failure event with error and duration details.
 */
export function emitComponentFailed(
  ctx: LifecycleManagerContext,
  result: { id: string; error?: unknown; duration: number },
): void {
  ctx.events.emit("component:failed", {
    component: {
      componentId: result.id,
      error: result.error,
      duration: result.duration,
    },
  });
}
