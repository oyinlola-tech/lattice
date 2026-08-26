/**
 * Runtime
 *
 * Public API for the core runtime subsystem.
 */

/*
 * Runtime
 */
export {
  DefaultRuntime,
  createRuntime,
} from "./runtime.js";

export type {
  RuntimeState as RuntimeLifecycleState,
  RuntimeDependencies,
  RuntimeStatus,
  Runtime,
} from "./runtime.js";

/*
 * Runtime options
 */
export {
  DEFAULT_RUNTIME_OPTIONS,
  resolveRuntimeOptions,
  validateRuntimeOptions,
  isRuntimeMode,
  isRuntimeRole,
  assertRuntimeMode,
  assertRuntimeRole,
} from "./runtime-options.js";

export type {
  RuntimeMode,
  RuntimeRole,
  RuntimeOptions,
  RuntimeStartupOptions,
  RuntimeShutdownOptions,
  RuntimeSignalOptions,
  RuntimeDiagnosticsOptions,
  RuntimeInfrastructure,
  ResolvedRuntimeOptions,
} from "./runtime-options.js";

/*
 * Runtime state
 */
export {
  RuntimeState,
  TERMINAL_RUNTIME_STATES,
  STARTABLE_RUNTIME_STATES,
  STOPPABLE_RUNTIME_STATES,
  TRANSITIONAL_RUNTIME_STATES,
  isRuntimeState,
  isRuntimeReady,
  isRuntimeFailed,
  isRuntimeTransitioning,
  isRuntimeTerminal,
  canStartRuntime,
  canStopRuntime,
  canTransitionRuntime,
  assertRuntimeState,
  assertRuntimeTransition,
  createRuntimeStateSnapshot,
  createRuntimeStateTransition,
  getRuntimeStateLabel,
  getRuntimeStates,
  getNextRuntimeStates,
  InvalidRuntimeStateError,
  InvalidRuntimeTransitionError,
} from "./runtime-state.js";

export type {
  RuntimeStateSnapshot,
  RuntimeStateTransition,
} from "./runtime-state.js";

/*
 * Runtime context
 */
export {
  DefaultRuntimeContext,
  createRuntimeId,
  createRuntimeIdentity,
  createRuntimeContext,
} from "./runtime-context.js";

export type {
  RuntimeIdentity,
  RuntimeTiming,
  RuntimeContextDependencies,
  RuntimeContext,
  RuntimeContextState,
} from "./runtime-context.js";

/*
 * Runtime environment
 */
export {
  DefaultRuntimeEnvironment,
  createRuntimeEnvironment,
  detectRuntimeEngine,
  detectPlatform,
  detectProcessInfo,
  detectHostInfo,
  detectCI,
  detectContainer,
  RuntimeEnvironmentError,
} from "./runtime-environment.js";

export type {
  RuntimePlatform,
  RuntimeEngine,
  RuntimeEnvironmentVariables,
  RuntimeProcessInfo,
  RuntimeHostInfo,
  RuntimeEngineInfo,
  RuntimeEnvironmentInfo,
  RuntimeEnvironment,
  RuntimeEnvironmentOptions,
} from "./runtime-environment.js";

/*
 * Runtime manager
 */
export {
  DefaultRuntimeManager,
  createRuntimeManager,
  RuntimeManagerError,
} from "./runtime-manager.js";

export type {
  RuntimeManagerDependencies,
  RuntimeManager,
} from "./runtime-manager.js";

/*
 * Runtime bootstrap
 */
export {
  DefaultRuntimeBootstrap,
  RuntimeBootstrapError,
  createRuntimeBootstrap,
} from "./runtime-bootstrap.js";

export type {
  RuntimeBootstrapDependencies,
  RuntimeBootstrapOptions,
  RuntimeBootstrapPhase,
  RuntimeBootstrapResult,
  RuntimeBootstrapError as RuntimeBootstrapErrorInfo,
} from "./runtime-bootstrap.js";

/*
 * Runtime shutdown
 */
export {
  DefaultRuntimeShutdown,
  RuntimeShutdownError,
  createRuntimeShutdown,
} from "./runtime-shutdown.js";

export type {
  RuntimeShutdownDependencies,
  RuntimeShutdownConfig,
  RuntimeShutdownPhase,
  RuntimeShutdownResult,
  RuntimeShutdownError as RuntimeShutdownErrorInfo,
} from "./runtime-shutdown.js";

/*
 * Runtime errors
 */
export {
  RuntimeError,
  RuntimeErrorCode,
  RuntimeStateError,
  RuntimeStartError,
  RuntimeStopError,
  RuntimeInitializationError,
  RuntimeLoadError,
  RuntimeTimeoutError,
  RuntimeDependencyError,
  RuntimeNotReadyError,
  RuntimeUnsupportedOperationError,
  RuntimeCancellationError,
  toRuntimeError,
  isRuntimeError,
  hasRuntimeErrorCode,
  createRuntimeError,
} from "./runtime-error.js";

export type {
  RuntimeOperation,
  RuntimeErrorPhase,
  RuntimeErrorMetadata,
  RuntimeErrorOptions,
  RuntimeErrorJSON,
} from "./runtime-error.js";
