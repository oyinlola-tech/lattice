/**
 * Specific lifecycle error classes.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import { LifecycleError } from "./lifecycleError.base.js";

/** Error thrown when a lifecycle state transition is invalid. */
export class LifecycleStateError extends LifecycleError {
  public readonly fromState: string;
  public readonly toState: string;

  constructor(fromState: string, toState: string, componentId?: string) {
    super(
      `Invalid lifecycle state transition from "${fromState}" to "${toState}".`,
      {
        code: ErrorCode.LIFECYCLE_STATE,
        componentId,
        metadata: { fromState, toState },
      },
    );
    this.name = "LifecycleStateError";
    this.fromState = fromState;
    this.toState = toState;
  }
}

/** Error thrown when a lifecycle operation times out. */
export class LifecycleTimeoutError extends LifecycleError {
  public readonly timeout: number;

  constructor(
    componentId: string,
    phase: string,
    timeout: number,
    cause?: unknown,
  ) {
    super(
      `Lifecycle operation timed out for component "${componentId}" during ${phase} after ${timeout}ms.`,
      {
        code: ErrorCode.LIFECYCLE_TIMEOUT,
        componentId,
        phase,
        cause,
        metadata: { timeout },
      },
    );
    this.name = "LifecycleTimeoutError";
    this.timeout = timeout;
  }
}

/** Error thrown when a circular lifecycle dependency is detected. */
export class LifecycleDependencyError extends LifecycleError {
  public readonly cycle: readonly string[];

  constructor(cycle: readonly string[]) {
    super(`Circular lifecycle dependency detected: ${cycle.join(" -> ")}.`, {
      code: ErrorCode.LIFECYCLE_DEPENDENCY,
      metadata: { cycle },
    });
    this.name = "LifecycleDependencyError";
    this.cycle = Object.freeze([...cycle]);
  }
}

/** Error thrown when a lifecycle component fails. */
export class LifecycleComponentError extends LifecycleError {
  constructor(componentId: string, phase: string, cause?: unknown) {
    super(`Component "${componentId}" failed during ${phase}.`, {
      code: ErrorCode.LIFECYCLE_COMPONENT,
      componentId,
      phase,
      cause,
    });
    this.name = "LifecycleComponentError";
  }
}

/** Error thrown when a lifecycle start operation fails. */
export class LifecycleStartError extends LifecycleError {
  constructor(componentId: string, cause?: unknown) {
    super(`Failed to start component "${componentId}".`, {
      code: ErrorCode.LIFECYCLE_START,
      componentId,
      phase: "start",
      cause,
    });
    this.name = "LifecycleStartError";
  }
}

/** Error thrown when a lifecycle stop operation fails. */
export class LifecycleStopError extends LifecycleError {
  constructor(componentId: string, cause?: unknown) {
    super(`Failed to stop component "${componentId}".`, {
      code: ErrorCode.LIFECYCLE_STOP,
      componentId,
      phase: "stop",
      cause,
    });
    this.name = "LifecycleStopError";
  }
}

/** Error thrown when a lifecycle rollback operation fails. */
export class LifecycleRollbackError extends LifecycleError {
  constructor(componentId: string, cause?: unknown) {
    super(`Failed to rollback component "${componentId}".`, {
      code: ErrorCode.LIFECYCLE_ROLLBACK,
      componentId,
      cause,
    });
    this.name = "LifecycleRollbackError";
  }
}

/** Error thrown when an operation is attempted on a disposed lifecycle manager. */
export class LifecycleDisposedError extends LifecycleError {
  constructor() {
    super(
      "Lifecycle manager has been disposed and cannot perform operations.",
      {
        code: ErrorCode.LIFECYCLE_DISPOSED,
        statusCode: 500,
      },
    );
    this.name = "LifecycleDisposedError";
  }
}
