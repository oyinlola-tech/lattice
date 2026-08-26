/**
 * Core lifecycle state machine and participant contracts.
 *
 * Lifecycle is the internal implementation used by LifecycleManager.
 * Consumers should use LifecycleManager as the primary API.
 */
export {
  LifecycleState,
  type LifecycleParticipant,
} from "./lifecycle.js";

/**
 * Individual lifecycle hooks.
 */
export {
  hasInitializeHook,
  hasStartHook,
  hasStopHook,
  hasDestroyHook,
  type OnInitialize,
  type OnStart,
  type OnStop,
  type OnDestroy,
  type LifecycleHook,
} from "./lifecycle-hook.js";

/**
 * Lifecycle orchestration.
 */
export {
  LifecycleManager,
  type LifecycleManagerOptions,
  type ManagedLifecycleComponent,
} from "./lifecycle-manager.js";

/**
 * Lifecycle registration and ordering.
 */
export {
  LifecycleRegistry,
  type LifecycleComponent,
  type LifecycleRegistration,
} from "./lifecycle-registry.js";

/**
 * Isolated lifecycle boundaries for applications,
 * modules, plugins, workers, and services.
 */
export {
  LifecycleScope,
  LifecycleScopeState,
  type LifecycleScopeOptions,
} from "./lifecycle-scope.js";