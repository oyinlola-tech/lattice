/**
 * Execution context.
 */
export {
  createExecutionContext,
  deriveExecutionContext,
  withExecutionMetadata,
  getExecutionDuration,
  type ExecutionContext,
  type CreateExecutionContextInput,
} from "./execution-context.js";

/**
 * Application-aware execution context.
 *
 * Context wraps ApplicationContext with execution-specific metadata
 * and mutable values. Use this when you need to track execution state
 * alongside application capabilities.
 */
export {
  Context,
  createContext,
  type ContextType,
  type ExecutionMetadata,
  type CreateContextOptions,
} from "./context.js";

/**
 * Async execution context storage.
 */
export {
  ContextStorage,
  createContextStorage,
} from "./context-storage.js";

/**
 * Framework context provider abstraction.
 */
export {
  DefaultContextProvider,
  createContextProvider,
  type ContextProvider,
} from "./context-provider.js";

/**
 * Strongly typed context keys.
 */
export {
  createContextKey,
  setContextValue,
  getContextValue,
  requireContextValue,
  hasContextValue,
  deleteContextValue,
  type ContextKey,
  type ContextValueStore,
} from "./context-key.js";

/**
 * Immutable typed context value collection.
 */
export {
  ContextValues,
  createContextValues,
} from "./context-values.js";

/**
 * Context snapshots for propagation across
 * asynchronous and distributed boundaries.
 */
export {
  createContextSnapshot,
  restoreContextSnapshot,
  deriveContextSnapshot,
  type ContextSnapshot,
} from "./context-snapshot.js";