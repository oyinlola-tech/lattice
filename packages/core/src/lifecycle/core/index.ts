/**
 * @oyinlola141/lattice-core/lifecycle/core
 *
 * Core lifecycle state machine, hooks, and registry.
 */

export { LifecycleState, type LifecycleParticipant } from "./lifecycle.js";

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
} from "./lifecycleHook.hook.js";

export {
  LifecycleRegistry,
  type LifecycleComponent,
  type LifecycleRegistration,
} from "./lifecycleRegistry.registry.js";
