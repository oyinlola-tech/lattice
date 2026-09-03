/**
 * @zudo/constants/lifecycle
 *
 * Lifecycle states, phases, valid transitions, and defaults.
 */

/** Lifecycle states — a strongly-typed state machine. */
export enum LifecycleState {
  IDLE = "idle",
  INITIALIZING = "initializing",
  INITIALIZED = "initialized",
  STARTING = "starting",
  STARTED = "started",
  READY = "ready",
  STOPPING = "stopping",
  STOPPED = "stopped",
  FAILED = "failed",
  DISPOSED = "disposed",
}

/** Lifecycle phases — the discrete hooks a component can implement. */
export enum LifecyclePhase {
  INITIALIZE = "initialize",
  START = "start",
  READY = "ready",
  STOP = "stop",
  DISPOSE = "dispose",
}

/** Valid state transitions for the lifecycle state machine. */
export const LIFECYCLE_VALID_TRANSITIONS: Readonly<
  Record<LifecycleState, readonly LifecycleState[]>
> = Object.freeze({
  [LifecycleState.IDLE]: Object.freeze([
    LifecycleState.INITIALIZING,
    LifecycleState.DISPOSED,
  ]),
  [LifecycleState.INITIALIZING]: Object.freeze([
    LifecycleState.INITIALIZED,
    LifecycleState.FAILED,
  ]),
  [LifecycleState.INITIALIZED]: Object.freeze([
    LifecycleState.STARTING,
    LifecycleState.STOPPING,
    LifecycleState.DISPOSED,
  ]),
  [LifecycleState.STARTING]: Object.freeze([
    LifecycleState.STARTED,
    LifecycleState.FAILED,
  ]),
  [LifecycleState.STARTED]: Object.freeze([
    LifecycleState.READY,
    LifecycleState.STOPPING,
    LifecycleState.FAILED,
  ]),
  [LifecycleState.READY]: Object.freeze([
    LifecycleState.STOPPING,
    LifecycleState.FAILED,
  ]),
  [LifecycleState.STOPPING]: Object.freeze([
    LifecycleState.STOPPED,
    LifecycleState.FAILED,
  ]),
  [LifecycleState.STOPPED]: Object.freeze([LifecycleState.DISPOSED]),
  [LifecycleState.FAILED]: Object.freeze([
    LifecycleState.STOPPING,
    LifecycleState.DISPOSED,
  ]),
  [LifecycleState.DISPOSED]: Object.freeze([]),
});

/** Default timeout for lifecycle operations (ms). */
export const LIFECYCLE_DEFAULT_TIMEOUT = 30_000;

/** Default timeout for individual component start (ms). */
export const LIFECYCLE_DEFAULT_START_TIMEOUT = 30_000;

/** Default timeout for individual component stop (ms). */
export const LIFECYCLE_DEFAULT_STOP_TIMEOUT = 10_000;

/** Default global shutdown deadline (ms). */
export const LIFECYCLE_DEFAULT_SHUTDOWN_TIMEOUT = 30_000;

/** Default concurrency limit for parallel component operations. */
export const LIFECYCLE_DEFAULT_CONCURRENCY = 10;

/** Default retry attempts. */
export const LIFECYCLE_DEFAULT_RETRY_ATTEMPTS = 3;

/** Default retry delay (ms). */
export const LIFECYCLE_DEFAULT_RETRY_DELAY = 500;

/** Maximum retry delay (ms). */
export const LIFECYCLE_DEFAULT_RETRY_MAX_DELAY = 10_000;
