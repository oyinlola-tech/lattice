/**
 * Runtime Shutdown
 *
 * Handles the shutdown pipeline for stopping and
 * destroying runtime modules.
 */

export {
  DefaultRuntimeShutdown,
  RuntimeShutdownError,
  withShutdownTimeout,
  createShutdownResult,
} from "./runtimeShutdown.core.js";

export { executeShutdownPipeline } from "./pipeline/index.js";

export type {
  RuntimeShutdownDependencies,
  RuntimeShutdownConfig,
  RuntimeShutdownPhase,
  RuntimeShutdownErrorInfo,
  RuntimeShutdownResult,
  RuntimeShutdown,
  ResolvedShutdownOptions,
} from "./runtimeShutdown.type.js";
