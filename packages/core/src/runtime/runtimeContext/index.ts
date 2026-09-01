/**
 * Runtime Context
 *
 * Provides read-only access to the runtime environment and
 * runtime-owned infrastructure.
 */

export { DefaultRuntimeContext } from "./runtimeContext.core.js";

export {
  createRuntimeId,
  createRuntimeIdentity,
  createRuntimeContext,
} from "./runtimeContext.factory.js";

export type {
  RuntimeIdentity,
  RuntimeTiming,
  RuntimeContextDependencies,
  RuntimeContext,
  RuntimeContextState,
} from "./runtimeContext.type.js";
