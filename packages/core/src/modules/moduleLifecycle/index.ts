/**
 * Module Lifecycle
 *
 * Manages the lifecycle phases of loaded modules:
 * initialize → start → stop → destroy.
 */

export {
  type ModuleLifecyclePhase,
  type ModuleLifecycleState,
  type ModuleLifecycleHooks,
  type ModuleLifecycleOptions,
  ModuleLifecycleError,
  type ModuleLifecycleResult,
  type LifecycleStateMap,
} from "./moduleLifecycle.type.js";

export {
  ensureStateSynchronized,
  getLifecycleState,
  requireLifecycleState,
  getAllLifecycleStates,
  isModuleInitialized,
  isModuleStarted,
  isModuleDestroyed,
  invokeLifecycleHook,
  canModuleEnterPhase,
  setLifecycleState,
  executeLifecyclePhase,
} from "./moduleLifecycle.stateMachine.js";

export {
  ModuleLifecycleManager,
  createModuleLifecycleManager,
} from "./moduleLifecycle.lifecycle.js";
