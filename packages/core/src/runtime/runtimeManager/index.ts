/**
 * Runtime Manager
 *
 * Top-level runtime lifecycle coordinator that owns the
 * runtime state and delegates to bootstrap/shutdown services.
 */

export {
  DefaultRuntimeManager,
} from "./runtimeManager.core.js";

export {
  RuntimeManagerError,
} from "./runtimeManager.error.js";

export {
  createRuntimeManager,
} from "./runtimeManager.factory.js";

export {
  performStart,
  performStop,
} from "./runtimeManager.lifecycle.js";

export type {
  RuntimeManagerDependencies,
  RuntimeManager,
  RuntimeManagerState,
} from "./runtimeManager.type.js";
