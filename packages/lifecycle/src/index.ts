/**
 * @zudoliblib/lifecycle
 *
 * Application and component lifecycle orchestration for the Zudolib framework.
 *
 * Manages state machines, dependency ordering, graceful shutdown, rollback,
 * timeouts, retries, and process signals.
 *
 * @example
 * ```ts
 * import { createLifecycleManager } from "@zudoliblib/lifecycle";
 *
 * const lifecycle = createLifecycleManager();
 *
 * lifecycle.register(database, { id: "database", critical: true });
 * lifecycle.register(queue, { id: "queue", dependsOn: ["database"] });
 * lifecycle.register(server, { id: "server", dependsOn: ["queue"] });
 *
 * await lifecycle.start();
 * // ... application running ...
 * await lifecycle.shutdown();
 * ```
 */

export { LifecycleStateMachine } from "./lifecycleState/index.js";
export {
  STARTUP_PHASES,
  SHUTDOWN_PHASES,
  getPhaseHookName,
  getComponentMethod,
} from "./lifecyclePhase/index.js";
export type {
  LifecycleComponent,
  LifecycleRegistrationOptions,
  LifecycleRetryOptions,
  LifecycleRegistration,
} from "./lifecycleComponent/index.js";
export type { LifecycleContext } from "./lifecycleContext/index.js";
export { createLifecycleContext } from "./lifecycleContext/index.js";
export { LifecycleRegistry } from "./lifecycleRegistry/index.js";
export {
  DependencyGraph,
  topologicalSort,
  reverseTopologicalSort,
  withTimeout,
  withAbort,
  withConcurrency,
} from "./lifecycleInternal/index.js";
export type { TopologicalStage } from "./lifecycleInternal/index.js";
export { buildExecutionPlan } from "./lifecyclePlan/index.js";
export type { ExecutionStage, ExecutionPlan } from "./lifecyclePlan/index.js";
export { LifecycleExecutor } from "./lifecycleExecutor/index.js";
export type { ExecutionResult } from "./lifecycleExecutor/index.js";
export {
  LifecycleManager,
  createLifecycleManager,
} from "./lifecycleManager/index.js";
export type { LifecycleManagerOptions } from "./lifecycleManager/index.js";
export { LifecycleEventEmitter } from "./lifecycleEvents/index.js";
export type {
  LifecycleEventType,
  LifecycleComponentEvent,
  LifecycleApplicationEvent,
  LifecycleEvent,
  LifecycleEventListener,
} from "./lifecycleEvents/index.js";
export {
  installSignalHandlers,
  DEFAULT_SHUTDOWN_SIGNALS,
} from "./lifecycleSignal/index.js";
export type { SignalHandlerOptions } from "./lifecycleSignal/index.js";
