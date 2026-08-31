/**
 * @lattice/lifecycle/manager/shutdown
 *
 * Shutdown orchestration — stops and disposes components in reverse order.
 */

import { LifecyclePhase, LifecycleState } from "@lattice/constants";
import { buildExecutionPlan } from "../lifecyclePlan/lifecyclePlan.core.js";
import { createLifecycleContext } from "../lifecycleContext/lifecycleContext.type.js";
import type { LifecycleManagerContext } from "./lifecycleManager.context.js";
import { transitionComponent } from "./lifecycleManager.context.js";

/** Shutdown phases in execution order. */
const SHUTDOWN_PHASES = ["stop", "dispose"] as const;

/**
 * Performs the full shutdown sequence: stop → dispose.
 * Idempotent — safe to call multiple times.
 */
export async function performShutdown(ctx: LifecycleManagerContext): Promise<void> {
  if (ctx.state.state === LifecycleState.DISPOSED) return;

  if (ctx.state.state !== LifecycleState.STOPPING && ctx.state.state !== LifecycleState.FAILED) {
    ctx.state.transition(LifecycleState.STOPPING);
  }
  ctx.events.emit("application:stopping", {});

  const deadline = Date.now() + ctx.shutdownTimeout;

  for (const phase of SHUTDOWN_PHASES) {
    if (deadline - Date.now() <= 0) break;

    try {
      await executeShutdownPhase(ctx, phase);
    } catch {
      // Shutdown must continue even if individual components fail.
    }
  }

  ctx.state.forceState(LifecycleState.DISPOSED);
  ctx.events.emit("application:stopped", { duration: Date.now() - ctx.startTime });
}

/** Executes a single shutdown phase across all registered components. */
async function executeShutdownPhase(
  ctx: LifecycleManagerContext,
  phase: "stop" | "dispose",
): Promise<void> {
  const plan = buildExecutionPlan(ctx.registry.getAll(), phase as LifecyclePhase);
  const context = createLifecycleContext(phase as LifecyclePhase, ctx.startTime);

  for (const stage of plan.stages) {
    const stageRegs = stage.components
      .map((id) => ctx.registry.get(id))
      .filter((r): r is NonNullable<typeof r> => r !== undefined);

    if (stageRegs.length === 0) continue;

    for (const reg of stageRegs) {
      transitionComponent(ctx, reg.id, LifecycleState.STOPPING);
    }

    await ctx.executor.executeStage(stageRegs, phase as LifecyclePhase, context, ctx.concurrency);

    const targetState = phase === "stop" ? LifecycleState.STOPPED : LifecycleState.DISPOSED;
    for (const reg of stageRegs) {
      transitionComponent(ctx, reg.id, targetState);
    }
  }
}
