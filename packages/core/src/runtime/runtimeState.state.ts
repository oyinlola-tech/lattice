/**
 * Runtime lifecycle states.
 *
 * The runtime moves through these states in a controlled order.
 */
export enum RuntimeState {
  CREATED = "created",
  BOOTSTRAPPING = "bootstrapping",
  READY = "ready",
  STOPPING = "stopping",
  STOPPED = "stopped",
  FAILED = "failed",
}

/**
 * Terminal runtime states.
 */
export const TERMINAL_RUNTIME_STATES:
  readonly RuntimeState[] =
  Object.freeze([
    RuntimeState.STOPPED,
  ]);

/**
 * Runtime states from which startup is allowed.
 */
export const STARTABLE_RUNTIME_STATES:
  readonly RuntimeState[] =
  Object.freeze([
    RuntimeState.CREATED,
  ]);

/**
 * Runtime states from which shutdown is allowed.
 */
export const STOPPABLE_RUNTIME_STATES:
  readonly RuntimeState[] =
  Object.freeze([
    RuntimeState.READY,
  ]);

/**
 * Runtime states that indicate the runtime is currently
 * performing a lifecycle operation.
 */
export const TRANSITIONAL_RUNTIME_STATES:
  readonly RuntimeState[] =
  Object.freeze([
    RuntimeState.BOOTSTRAPPING,
    RuntimeState.STOPPING,
  ]);

/**
 * Runtime status information.
 */
export interface RuntimeStateSnapshot {
  /**
   * Current state.
   */
  readonly state:
    RuntimeState;

  /**
   * Whether the runtime is currently operational.
   */
  readonly ready:
    boolean;

  /**
   * Whether the runtime has reached a terminal state.
   */
  readonly terminal:
    boolean;

  /**
   * Whether the runtime is currently transitioning.
   */
  readonly transitioning:
    boolean;

  /**
   * Whether the runtime has failed.
   */
  readonly failed:
    boolean;
}

/**
 * Describes a runtime state transition.
 */
export interface RuntimeStateTransition {
  /**
   * Previous state.
   */
  readonly from:
    RuntimeState;

  /**
   * New state.
   */
  readonly to:
    RuntimeState;

  /**
   * Time at which the transition occurred.
   */
  readonly timestamp:
    Date;

  /**
   * Optional reason for the transition.
   */
  readonly reason?:
    string;
}

/**
 * Checks whether a value is a valid RuntimeState.
 */
export function isRuntimeState(
  value: unknown,
): value is RuntimeState {
  return (
    value ===
      RuntimeState.CREATED ||
    value ===
      RuntimeState.BOOTSTRAPPING ||
    value ===
      RuntimeState.READY ||
    value ===
      RuntimeState.STOPPING ||
    value ===
      RuntimeState.STOPPED ||
    value ===
      RuntimeState.FAILED
  );
}

/**
 * Returns whether the runtime is ready.
 */
export function isRuntimeReady(
  state:
    RuntimeState,
): boolean {
  return (
    state ===
    RuntimeState.READY
  );
}

/**
 * Returns whether the runtime has failed.
 */
export function isRuntimeFailed(
  state:
    RuntimeState,
): boolean {
  return (
    state ===
    RuntimeState.FAILED
  );
}

/**
 * Returns whether the runtime is currently transitioning.
 */
export function isRuntimeTransitioning(
  state:
    RuntimeState,
): boolean {
  return (
    state ===
      RuntimeState.BOOTSTRAPPING ||
    state ===
      RuntimeState.STOPPING
  );
}

/**
 * Returns whether the runtime is in a terminal state.
 */
export function isRuntimeTerminal(
  state:
    RuntimeState,
): boolean {
  return TERMINAL_RUNTIME_STATES.includes(
    state,
  );
}

/**
 * Returns whether startup can begin from the supplied state.
 */
export function canStartRuntime(
  state:
    RuntimeState,
): boolean {
  return STARTABLE_RUNTIME_STATES.includes(
    state,
  );
}

/**
 * Returns whether shutdown can begin from the supplied state.
 */
export function canStopRuntime(
  state:
    RuntimeState,
): boolean {
  return STOPPABLE_RUNTIME_STATES.includes(
    state,
  );
}

/**
 * Returns whether a state transition is valid.
 */
export function canTransitionRuntime(
  from:
    RuntimeState,
  to:
    RuntimeState,
): boolean {
  if (
    from === to
  ) {
    return true;
  }

  switch (from) {
    case RuntimeState.CREATED:
      return (
        to ===
        RuntimeState.BOOTSTRAPPING
      );

    case RuntimeState.BOOTSTRAPPING:
      return (
        to ===
          RuntimeState.READY ||
        to ===
          RuntimeState.FAILED
      );

    case RuntimeState.READY:
      return (
        to ===
        RuntimeState.STOPPING
      );

    case RuntimeState.STOPPING:
      return (
        to ===
          RuntimeState.STOPPED ||
        to ===
          RuntimeState.FAILED
      );

    case RuntimeState.FAILED:
      return false;

    case RuntimeState.STOPPED:
      return false;

    default:
      return false;
  }
}

/**
 * Asserts that a runtime state is valid.
 */
export function assertRuntimeState(
  value: unknown,
): asserts value is RuntimeState {
  if (
    !isRuntimeState(value)
  ) {
    throw new InvalidRuntimeStateError(
      `Invalid runtime state: "${String(value)}".`,
    );
  }
}

/**
 * Asserts that a runtime transition is valid.
 */
export function assertRuntimeTransition(
  from:
    RuntimeState,
  to:
    RuntimeState,
): void {
  if (
    canTransitionRuntime(
      from,
      to,
    )
  ) {
    return;
  }

  throw new InvalidRuntimeTransitionError(
    from,
    to,
  );
}

/**
 * Creates a runtime state snapshot.
 */
export function createRuntimeStateSnapshot(
  state:
    RuntimeState,
): RuntimeStateSnapshot {
  return Object.freeze({
    state,

    ready:
      isRuntimeReady(
        state,
      ),

    terminal:
      isRuntimeTerminal(
        state,
      ),

    transitioning:
      isRuntimeTransitioning(
        state,
      ),

    failed:
      isRuntimeFailed(
        state,
      ),
  });
}

/**
 * Creates a state transition record.
 */
export function createRuntimeStateTransition(
  from:
    RuntimeState,
  to:
    RuntimeState,
  reason?:
    string,
): RuntimeStateTransition {
  assertRuntimeTransition(
    from,
    to,
  );

  return Object.freeze({
    from,

    to,

    timestamp:
      new Date(),

    reason,
  });
}

/**
 * Returns a human-readable state name.
 */
export function getRuntimeStateLabel(
  state:
    RuntimeState,
): string {
  switch (state) {
    case RuntimeState.CREATED:
      return "Created";

    case RuntimeState.BOOTSTRAPPING:
      return "Bootstrapping";

    case RuntimeState.READY:
      return "Ready";

    case RuntimeState.STOPPING:
      return "Stopping";

    case RuntimeState.STOPPED:
      return "Stopped";

    case RuntimeState.FAILED:
      return "Failed";

    default:
      return "Unknown";
  }
}

/**
 * Returns all possible runtime states.
 */
export function getRuntimeStates():
  readonly RuntimeState[] {
  return Object.freeze([
    RuntimeState.CREATED,
    RuntimeState.BOOTSTRAPPING,
    RuntimeState.READY,
    RuntimeState.STOPPING,
    RuntimeState.STOPPED,
    RuntimeState.FAILED,
  ]);
}

/**
 * Returns the states that can immediately follow
 * the supplied state.
 */
export function getNextRuntimeStates(
  state:
    RuntimeState,
):
  readonly RuntimeState[] {
  switch (state) {
    case RuntimeState.CREATED:
      return Object.freeze([
        RuntimeState.BOOTSTRAPPING,
      ]);

    case RuntimeState.BOOTSTRAPPING:
      return Object.freeze([
        RuntimeState.READY,
        RuntimeState.FAILED,
      ]);

    case RuntimeState.READY:
      return Object.freeze([
        RuntimeState.STOPPING,
      ]);

    case RuntimeState.STOPPING:
      return Object.freeze([
        RuntimeState.STOPPED,
        RuntimeState.FAILED,
      ]);

    case RuntimeState.FAILED:
      return Object.freeze([]);

    case RuntimeState.STOPPED:
      return Object.freeze([]);

    default:
      return Object.freeze([]);
  }
}import {
  RuntimeStateError,
} from "@lattice/errors";

/**
 * Error thrown when an invalid runtime state is encountered.
 */
export class InvalidRuntimeStateError
  extends RuntimeStateError {
  public readonly state:
    string;

  public constructor(
    message:
      string,
  ) {
    super(message);

    this.state = message;
  }
}

/**
 * Error thrown when an invalid runtime state transition
 * is attempted.
 */
export class InvalidRuntimeTransitionError
  extends RuntimeStateError {
  public readonly from:
    RuntimeState;

  public readonly to:
    RuntimeState;

  public constructor(
    from:
    RuntimeState,
    to:
    RuntimeState,
  ) {
    super(
      `Invalid runtime state transition from "${from}" to "${to}".`,
    );

    this.from = from;
    this.to = to;
  }
}