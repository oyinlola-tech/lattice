import type {
  ModuleId,
} from "../module.js";

import {
  ModuleErrorCode,
  ModuleError,
} from "./moduleError.base.js";

/**
 * Maps lifecycle phases to stable error codes.
 */
export function getLifecycleErrorCode(
  phase: string,
): ModuleErrorCode {
  switch (phase) {
    case "initialize":
    case "initializing":
      return ModuleErrorCode
        .INITIALIZATION_FAILED;

    case "start":
    case "starting":
      return ModuleErrorCode
        .START_FAILED;

    case "stop":
    case "stopping":
      return ModuleErrorCode
        .STOP_FAILED;

    case "destroy":
    case "destroying":
      return ModuleErrorCode
        .DESTROY_FAILED;

    default:
      return ModuleErrorCode
        .UNKNOWN;
  }
}

/**
 * Error thrown when module instantiation fails.
 */
export class ModuleInstantiationError
  extends ModuleError {
  public constructor(
    moduleId: ModuleId,
    cause: unknown,
  ) {
    const message =
      cause instanceof Error
        ? cause.message
        : String(cause);

    super(
      `Failed to instantiate module "${moduleId}": ${message}`,
      {
        code:
          ModuleErrorCode
            .LOAD_FAILED,
        moduleId,
        cause,
      },
    );

    this.name =
      "ModuleInstantiationError";
  }
}

/**
 * Error thrown when a module lifecycle operation fails.
 */
export class ModuleOperationError
  extends ModuleError {
  public constructor(
    moduleId: ModuleId,
    phase: string,
    cause: unknown,
  ) {
    const message =
      cause instanceof Error
        ? cause.message
        : String(cause);

    const code =
      getLifecycleErrorCode(
        phase,
      );

    super(
      `Module "${moduleId}" failed during ${phase}: ${message}`,
      {
        code,
        moduleId,
        phase,
        cause,
      },
    );

    this.name =
      "ModuleOperationError";
  }
}

/**
 * Error thrown when a module has an invalid runtime instance.
 */
export class InvalidModuleInstanceError
  extends ModuleError {
  public constructor(
    moduleId: ModuleId,
    message?: string,
  ) {
    super(
      message ??
        `Module "${moduleId}" produced an invalid runtime instance.`,
      {
        code:
          ModuleErrorCode
            .INVALID_INSTANCE,
        moduleId,
      },
    );

    this.name =
      "InvalidModuleInstanceError";
  }
}

/**
 * Error thrown when a module operation violates its current state.
 */
export class InvalidModuleStateError
  extends ModuleError {
  public readonly currentState:
    string;

  public readonly expectedStates:
    readonly string[];

  public constructor(
    moduleId: ModuleId,
    currentState: string,
    expectedStates:
      readonly string[],
  ) {
    super(
      `Module "${moduleId}" is in state "${currentState}" but must be in one of: ${expectedStates.join(", ")}.`,
      {
        code:
          ModuleErrorCode
            .INVALID_STATE,
        moduleId,
        metadata: {
          currentState,
          expectedStates,
        },
      },
    );

    this.name =
      "InvalidModuleStateError";

    this.currentState =
      currentState;

    this.expectedStates =
      Object.freeze([
        ...expectedStates,
      ]);
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      currentState:
        this.currentState,
      expectedStates:
        this.expectedStates,
    };
  }
}

/**
 * Error thrown when an operation cannot be performed
 * because another lifecycle operation is currently running.
 */
export class ModuleOperationInProgressError
  extends ModuleError {
  public constructor(
    operation: string,
  ) {
    super(
      `A module lifecycle operation is already in progress: "${operation}".`,
      {
        code:
          ModuleErrorCode
            .OPERATION_IN_PROGRESS,
        metadata: {
          operation,
        },
      },
    );

    this.name =
      "ModuleOperationInProgressError";
  }
}
