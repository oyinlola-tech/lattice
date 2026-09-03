/**
 * @zudo/lifecycle/manager/startup
 *
 * Startup orchestration — initializes, starts, and readies components.
 */

import { LifecyclePhase, LifecycleState } from "@zudo/constants";
import { buildExecutionPlan } from "../lifecyclePlan/lifecyclePlan.core.js";
import { createLifecycleContext } from "../lifecycleContext/lifecycleContext.type.js";
import type { LifecycleManagerContext } from "./lifecycleManager.context.js";
import {
  transitionComponent,
  transitionComponentBatch,
  emitComponentFailed,
} from "./lifecycleManager.context.js";
import { performShutdown } from "./lifecycleManager.shutdown.js";

/** Phase name union for startup orchestration. */
type StartupPhase = "initialize" | "start" | "ready";

/** Maps startup phases to their target component state after success. */
const SUCCESS_STATE: Record<StartupPhase, LifecycleState> = {
  initialize: LifecycleState.INITIALIZED,
  start: LifecycleState.STARTED,
  ready: LifecycleState.READY,
};

/** Maps startup phases to their component state during execution. */
const EXECUTING_STATE: Record<StartupPhase, LifecycleState> = {
  initialize: LifecycleState.INITIALIZING,
  start: LifecycleState.STARTING,
  ready: LifecycleState.STARTED,
};

/**
 * Performs the full startup sequence: initialize → start → ready.
 */
export async function performStartup(
  ctx: LifecycleManagerContext,
): Promise<void> {
  ctx.startTime = Date.now();
  ctx.state.transition(LifecycleState.INITIALIZING);
  ctx.events.emit("application:initializing", {});

  try {
    ctx.registry.freeze();

    const initOk = await executePhase(ctx, "initialize");
    if (!initOk) {
      await performShutdown(ctx);
      return;
    }
    ctx.state.transition(LifecycleState.INITIALIZED);

    ctx.state.transition(LifecycleState.STARTING);
    const startOk = await executePhase(ctx, "start");
    if (!startOk) {
      await performShutdown(ctx);
      return;
    }
    ctx.state.transition(LifecycleState.STARTED);

    const readyOk = await executePhase(ctx, "ready");
    if (readyOk) {
      ctx.state.transition(LifecycleState.READY);
      ctx.events.emit("application:ready", {
        duration: Date.now() - ctx.startTime,
      });
    }
  } catch (error) {
    if (ctx.state.state !== LifecycleState.FAILED) {
      ctx.state.forceState(LifecycleState.FAILED);
    }
    await performShutdown(ctx);
    throw error;
  }
}

/**
 * Executes a single startup phase across all registered components.
 * Returns false if a critical component failed.
 */
async function executePhase(
  ctx: LifecycleManagerContext,
  phase: StartupPhase,
): Promise<boolean> {
  const plan = buildExecutionPlan(
    ctx.registry.getAll(),
    phase as LifecyclePhase,
  );
  const context = createLifecycleContext(
    phase as LifecyclePhase,
    ctx.startTime,
  );

  for (const stage of plan.stages) {
    const stageRegs = stage.components
      .map((id) => ctx.registry.get(id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined);

    if (stageRegs.length === 0) continue;

    transitionComponentBatch(
      ctx,
      stageRegs.map((r) => r.id),
      EXECUTING_STATE[phase],
    );
    ctx.events.emit("component:starting", {
      component: { componentId: stage.components.join(",") },
    });

    const results = await ctx.executor.executeStage(
      stageRegs,
      phase as LifecyclePhase,
      context,
      ctx.concurrency,
    );

    for (const result of results) {
      const existing = ctx.results.get(result.id) ?? [];
      ctx.results.set(result.id, [...existing, result]);

      if (!result.success) {
        transitionComponent(ctx, result.id, LifecycleState.FAILED);
        emitComponentFailed(ctx, result);
        if (ctx.registry.get(result.id)?.critical) {
          ctx.state.forceState(LifecycleState.FAILED);
          return false;
        }
      } else {
        transitionComponent(ctx, result.id, SUCCESS_STATE[phase]);
        ctx.events.emit("component:started", {
          component: { componentId: result.id, duration: result.duration },
        });
      }
    }
  }

  return true;
}
