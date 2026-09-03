/**
 * @zudolib/core/context/core
 *
 * Core context types and key management.
 */

export {
  Context,
  createContext,
  type ContextType,
  type ExecutionMetadata,
  type CreateContextOptions,
} from "./context.js";

export {
  createExecutionContext,
  deriveExecutionContext,
  withExecutionMetadata,
  getExecutionDuration,
  type ExecutionContext,
  type CreateExecutionContextInput,
} from "./executionContext.context.js";

export {
  createContextKey,
  setContextValue,
  getContextValue,
  requireContextValue,
  hasContextValue,
  deleteContextValue,
  type ContextKey,
  type ContextValueStore,
} from "./contextKey.key.js";
