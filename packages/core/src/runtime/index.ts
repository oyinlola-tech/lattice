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
} from "./runtimeOptions/index.js";

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
} from "./runtimeOptions/index.js";

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
} from "./runtimeState.state.js";

export type {
  RuntimeStateSnapshot,
  RuntimeStateTransition,
} from "./runtimeState.state.js";

/*
 * Runtime context
 */
export {
  DefaultRuntimeContext,
  createRuntimeId,
  createRuntimeIdentity,
  createRuntimeContext,
} from "./runtimeContext/index.js";

export type {
  RuntimeIdentity,
  RuntimeTiming,
  RuntimeContextDependencies,
  RuntimeContext,
  RuntimeContextState,
} from "./runtimeContext/index.js";

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
} from "./runtimeEnvironment/index.js";

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
} from "./runtimeEnvironment/index.js";

/*
 * Runtime manager
 */
export {
  DefaultRuntimeManager,
  createRuntimeManager,
  RuntimeManagerError,
} from "./runtimeManager/index.js";

export type {
  RuntimeManagerDependencies,
  RuntimeManager,
} from "./runtimeManager/index.js";

/*
 * Runtime bootstrap
 */
export {
  DefaultRuntimeBootstrap,
  RuntimeBootstrapError,
} from "./runtimeBootstrap/index.js";

export type {
  RuntimeBootstrapDependencies,
  RuntimeBootstrapOptions,
  RuntimeBootstrapPhase,
  RuntimeBootstrapResult,
  RuntimeBootstrapErrorInfo,
} from "./runtimeBootstrap/index.js";

/*
 * Runtime shutdown
 */
export {
  DefaultRuntimeShutdown,
  RuntimeShutdownError,
} from "./runtimeShutdown/index.js";

export type {
  RuntimeShutdownDependencies,
  RuntimeShutdownConfig,
  RuntimeShutdownPhase,
  RuntimeShutdownResult,
  RuntimeShutdownErrorInfo,
} from "./runtimeShutdown/index.js";

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
} from "./runtimeError/index.js";

export type {
  RuntimeOperation,
  RuntimeErrorPhase,
  RuntimeErrorMetadata,
  RuntimeErrorOptions,
  RuntimeErrorJSON,
} from "./runtimeError/index.js";
