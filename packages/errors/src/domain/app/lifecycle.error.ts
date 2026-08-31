/**
 * Lifecycle error classes — re-exports from focused files.
 */

export {
  LifecycleError,
  createLifecycleError,
  isLifecycleError,
} from "./lifecycleError.base.js";
export type { LifecycleErrorOptions } from "./lifecycleError.base.js";

export {
  LifecycleStateError,
  LifecycleTimeoutError,
  LifecycleDependencyError,
  LifecycleComponentError,
  LifecycleStartError,
  LifecycleStopError,
  LifecycleRollbackError,
  LifecycleDisposedError,
} from "./lifecycleError.types.js";
