import {
  FrameworkError,
} from "../errors/framework-error.js";

import {
  ErrorCode,
} from "../errors/error-code.js";

/**
 * Runtime lifecycle operations.
 */
export type RuntimeOperation =
  | "create"
  | "start"
  | "bootstrap"
  | "load"
  | "initialize"
  | "run"
  | "stop"
  | "shutdown"
  | "destroy"
  | "restart"
  | "dispose";

/**
 * Runtime lifecycle phases.
 */
export type RuntimeErrorPhase =
  | "created"
  | "bootstrapping"
  | "loading"
  | "loaded"
  | "initializing"
  | "initialized"
  | "starting"
  | "ready"
  | "stopping"
  | "stopped"
  | "destroying"
  | "destroyed"
  | "failed";

/**
 * Stable runtime error codes.
 *
 * Each code maps to a canonical ErrorCode constant.
 * Uses `as const` instead of enum because ErrorCode values are strings.
 */
export const RuntimeErrorCode = {
  RUNTIME_FAILURE: ErrorCode.RUNTIME_FAILURE,
  RUNTIME_ALREADY_STARTED: ErrorCode.RUNTIME_ALREADY_STARTED,
  RUNTIME_ALREADY_STOPPED: ErrorCode.RUNTIME_ALREADY_STOPPED,
  RUNTIME_FAILED: ErrorCode.RUNTIME_FAILED,
  INVALID_STATE_TRANSITION: ErrorCode.RUNTIME_INVALID_TRANSITION,
  BOOTSTRAP_FAILED: ErrorCode.RUNTIME_BOOTSTRAP_FAILED,
  BOOTSTRAP_TIMEOUT: ErrorCode.RUNTIME_BOOTSTRAP_TIMEOUT,
  MODULE_LOAD_FAILED: ErrorCode.MODULE_LOAD_FAILED,
  MODULE_INITIALIZATION_FAILED: ErrorCode.MODULE_INITIALIZATION_FAILED,
  MODULE_START_FAILED: ErrorCode.MODULE_START_FAILED,
  SHUTDOWN_FAILED: ErrorCode.RUNTIME_SHUTDOWN_FAILED,
  SHUTDOWN_TIMEOUT: ErrorCode.RUNTIME_SHUTDOWN_TIMEOUT,
  MODULE_STOP_FAILED: ErrorCode.MODULE_STOP_FAILED,
  MODULE_DESTROY_FAILED: ErrorCode.MODULE_DESTROY_FAILED,
  OPERATION_TIMEOUT: ErrorCode.RUNTIME_OPERATION_TIMEOUT,
  INVALID_CONFIGURATION: ErrorCode.RUNTIME_INVALID_CONFIGURATION,
  MISSING_DEPENDENCY: ErrorCode.RUNTIME_MISSING_DEPENDENCY,
  INVALID_ENVIRONMENT: ErrorCode.RUNTIME_INVALID_ENVIRONMENT,
  RUNTIME_NOT_READY: ErrorCode.RUNTIME_NOT_READY,
  UNSUPPORTED_OPERATION: ErrorCode.RUNTIME_UNSUPPORTED_OPERATION,
  OPERATION_CANCELLED: ErrorCode.RUNTIME_OPERATION_CANCELLED,
} as const;

/**
 * Union type of all runtime error code values.
 */
export type RuntimeErrorCode =
  (typeof RuntimeErrorCode)[keyof typeof RuntimeErrorCode];

/**
 * Metadata attached to a runtime error.
 */
export type RuntimeErrorMetadata =
  Readonly<
    Record<string, unknown>
  >;

/**
 * Options for constructing a RuntimeError.
 */
export interface RuntimeErrorOptions {
  /**
   * Stable runtime error code.
   */
  readonly code?:
    RuntimeErrorCode;

  /**
   * Runtime operation that failed.
   */
  readonly operation?:
    RuntimeOperation;

  /**
   * Runtime lifecycle phase.
   */
  readonly phase?:
    RuntimeErrorPhase;

  /**
   * Runtime identifier.
   */
  readonly runtimeId?:
    string;

  /**
   * Runtime name.
   */
  readonly runtimeName?:
    string;

  /**
   * Module name associated with the error.
   */
  readonly moduleName?:
    string;

  /**
   * Structured metadata.
   */
  readonly metadata?:
    RuntimeErrorMetadata;

  /**
   * Original error.
   */
  readonly cause?:
    unknown;

  /**
   * Whether the error should be considered recoverable.
   */
  readonly recoverable?:
    boolean;
}

/**
 * Base error for all runtime failures.
 *
 * Extends FrameworkError so runtime errors can be caught
 * uniformly with other framework errors.
 */
export class RuntimeError
  extends FrameworkError {
  /**
   * Runtime operation.
   */
  public readonly operation?:
    RuntimeOperation;

  /**
   * Runtime lifecycle phase.
   */
  public readonly phase?:
    RuntimeErrorPhase;

  /**
   * Runtime identifier.
   */
  public readonly runtimeId?:
    string;

  /**
   * Runtime name.
   */
  public readonly runtimeName?:
    string;

  /**
   * Module associated with the error.
   */
  public readonly moduleName?:
    string;

  /**
   * Structured metadata.
   */
  public readonly errorMetadata:
    RuntimeErrorMetadata;

  /**
   * Whether the error may be recovered from.
   */
  public readonly recoverable:
    boolean;

  public constructor(
    message:
      string,
    options:
      RuntimeErrorOptions = {},
  ) {
    const details: Record<
      string,
      unknown
    > = {};

    if (
      options.operation !== undefined
    ) {
      details.operation =
        options.operation;
    }

    if (
      options.phase !== undefined
    ) {
      details.phase =
        options.phase;
    }

    if (
      options.runtimeId !== undefined
    ) {
      details.runtimeId =
        options.runtimeId;
    }

    if (
      options.runtimeName !== undefined
    ) {
      details.runtimeName =
        options.runtimeName;
    }

    if (
      options.moduleName !== undefined
    ) {
      details.moduleName =
        options.moduleName;
    }

    if (
      options.metadata !== undefined
    ) {
      details.metadata =
        options.metadata;
    }

    if (
      options.recoverable !== undefined
    ) {
      details.recoverable =
        options.recoverable;
    }

    super(message, {
      code:
        options.code ??
        RuntimeErrorCode
          .RUNTIME_FAILURE,
      details,
      cause: options.cause,
    });

    this.name =
      "RuntimeError";

    this.operation =
      options.operation;

    this.phase =
      options.phase;

    this.runtimeId =
      options.runtimeId;

    this.runtimeName =
      options.runtimeName;

    this.moduleName =
      options.moduleName;

    this.errorMetadata =
      Object.freeze({
        ...(options.metadata ??
          {}),
      });

    this.recoverable =
      options.recoverable ??
      false;
  }

  /**
   * Returns the original error when it is an Error.
   */
  public getCause():
    | Error
    | undefined {
    return normalizeError(
      this.cause,
    );
  }

  /**
   * Converts the runtime error into a serializable object.
   */
  public override toJSON():
    RuntimeErrorJSON {
    return {
      ...super.toJSON(),

      operation:
        this.operation,

      phase:
        this.phase,

      runtimeId:
        this.runtimeId,

      runtimeName:
        this.runtimeName,

      moduleName:
        this.moduleName,

      errorMetadata:
        this.errorMetadata,

      recoverable:
        this.recoverable,
    };
  }
}

/**
 * Serializable representation of RuntimeError.
 */
export interface RuntimeErrorJSON {
  readonly name:
    string;

  readonly message:
    string;

  readonly code:
    string;

  readonly operation?:
    RuntimeOperation;

  readonly phase?:
    RuntimeErrorPhase;

  readonly runtimeId?:
    string;

  readonly runtimeName?:
    string;

  readonly moduleName?:
    string;

  readonly errorMetadata:
    RuntimeErrorMetadata;

  readonly recoverable:
    boolean;

  readonly details?:
    unknown;

  readonly status?:
    number;
}

/**
 * Error thrown when runtime state transitions are invalid.
 */
export class RuntimeStateError
  extends RuntimeError {
  public readonly from:
    RuntimeErrorPhase | string;

  public readonly to:
    RuntimeErrorPhase | string;

  public constructor(
    from:
      | RuntimeErrorPhase
      | string,
    to:
      | RuntimeErrorPhase
      | string,
    options:
      Omit<
        RuntimeErrorOptions,
        "code"
      > = {},
  ) {
    super(
      `Invalid runtime state transition from "${from}" to "${to}".`,
      {
        ...options,

        code: RuntimeErrorCode.INVALID_STATE_TRANSITION,

        operation:
          options.operation ??
          "run",

        metadata: {
          ...(options.metadata ??
            {}),

          from,

          to,
        },
      },
    );

    this.name =
      "RuntimeStateError";

    this.from =
      from;

    this.to =
      to;
  }
}

/**
 * Error thrown when runtime startup fails.
 */
export class RuntimeStartError
  extends RuntimeError {
  public constructor(
    message:
      string,
    options:
      Omit<
        RuntimeErrorOptions,
        "operation"
      > = {},
  ) {
    super(message, {
      ...options,

      operation:
        "start",

      code:
        options.code ??
        RuntimeErrorCode
          .BOOTSTRAP_FAILED,
    });

    this.name =
      "RuntimeStartError";
  }
}

/**
 * Error thrown when runtime shutdown fails.
 */
export class RuntimeStopError
  extends RuntimeError {
  public constructor(
    message:
      string,
    options:
      Omit<
        RuntimeErrorOptions,
        "operation"
      > = {},
  ) {
    super(message, {
      ...options,

      operation:
        "stop",

      code:
        options.code ??
        RuntimeErrorCode
          .SHUTDOWN_FAILED,
    });

    this.name =
      "RuntimeStopError";
  }
}

/**
 * Error thrown when runtime initialization fails.
 */
export class RuntimeInitializationError
  extends RuntimeError {
  public constructor(
    message:
      string,
    options:
      Omit<
        RuntimeErrorOptions,
        "operation"
      > = {},
  ) {
    super(message, {
      ...options,

      operation:
        "initialize",

      code:
        options.code ??
        RuntimeErrorCode
          .MODULE_INITIALIZATION_FAILED,
    });

    this.name =
      "RuntimeInitializationError";
  }
}

/**
 * Error thrown when runtime loading fails.
 */
export class RuntimeLoadError
  extends RuntimeError {
  public constructor(
    message:
      string,
    options:
      Omit<
        RuntimeErrorOptions,
        "operation"
      > = {},
  ) {
    super(message, {
      ...options,

      operation:
        "load",

      code:
        options.code ??
        RuntimeErrorCode
          .MODULE_LOAD_FAILED,
    });

    this.name =
      "RuntimeLoadError";
  }
}

/**
 * Error thrown when a runtime operation times out.
 */
export class RuntimeTimeoutError
  extends RuntimeError {
  public readonly timeoutMs:
    number;

  public constructor(
    message:
      string,
    timeoutMs:
      number,
    options:
      Omit<
        RuntimeErrorOptions,
        "code"
      > = {},
  ) {
    super(message, {
      ...options,

      code: RuntimeErrorCode.OPERATION_TIMEOUT,

      metadata: {
        ...(options.metadata ??
          {}),

        timeoutMs,
      },
    });

    this.name =
      "RuntimeTimeoutError";

    this.timeoutMs =
      timeoutMs;
  }
}

/**
 * Error thrown when a runtime dependency is unavailable.
 */
export class RuntimeDependencyError
  extends RuntimeError {
  public readonly dependency:
    string;

  public constructor(
    dependency:
      string,
    options:
      Omit<
        RuntimeErrorOptions,
        "code"
      > = {},
  ) {
    super(
      `Required runtime dependency "${dependency}" is not available.`,
      {
        ...options,

        code: RuntimeErrorCode.MISSING_DEPENDENCY,

        metadata: {
          ...(options.metadata ??
            {}),

          dependency,
        },
      },
    );

    this.name =
      "RuntimeDependencyError";

    this.dependency =
      dependency;
  }
}

/**
 * Error thrown when the runtime is not ready.
 */
export class RuntimeNotReadyError
  extends RuntimeError {
  public constructor(
    message:
      string =
        "Runtime is not ready.",
    options:
      Omit<
        RuntimeErrorOptions,
        "code"
      > = {},
  ) {
    super(message, {
      ...options,

      code: RuntimeErrorCode.RUNTIME_NOT_READY,
    });

    this.name =
      "RuntimeNotReadyError";
  }
}

/**
 * Error thrown when a runtime operation is unsupported.
 */
export class RuntimeUnsupportedOperationError
  extends RuntimeError {
  public constructor(
    operation:
      string,
    options:
      Omit<
        RuntimeErrorOptions,
        "code"
      > = {},
  ) {
    super(
      `Runtime operation "${operation}" is not supported.`,
      {
        ...options,

        code: RuntimeErrorCode.UNSUPPORTED_OPERATION,

        metadata: {
          ...(options.metadata ??
            {}),

          operation,
        },
      },
    );

    this.name =
      "RuntimeUnsupportedOperationError";
  }
}

/**
 * Error thrown when a runtime operation is cancelled.
 */
export class RuntimeCancellationError
  extends RuntimeError {
  public constructor(
    message:
      string =
        "Runtime operation was cancelled.",
    options:
      Omit<
        RuntimeErrorOptions,
        "code"
      > = {},
  ) {
    super(message, {
      ...options,

      code: RuntimeErrorCode.OPERATION_CANCELLED,
    });

    this.name =
      "RuntimeCancellationError";
  }
}

/**
 * Creates a RuntimeError from an unknown thrown value.
 */
export function toRuntimeError(
  error:
    unknown,
  options:
    RuntimeErrorOptions = {},
): RuntimeError {
  if (
    error instanceof
    RuntimeError
  ) {
    return error;
  }

  if (
    error instanceof
    Error
  ) {
    return new RuntimeError(
      error.message,
      {
        ...options,

        cause:
          error,
      },
    );
  }

  return new RuntimeError(
    String(error),
    {
      ...options,

      cause:
        error,
    },
  );
}

/**
 * Checks whether an unknown value is a RuntimeError.
 */
export function isRuntimeError(
  error:
    unknown,
): error is RuntimeError {
  return (
    error instanceof
    RuntimeError
  );
}

/**
 * Checks whether an unknown error has a specific runtime code.
 */
export function hasRuntimeErrorCode(
  error:
    unknown,
  code:
    RuntimeErrorCode,
): boolean {
  return (
    isRuntimeError(error) &&
    error.code === code
  );
}

/**
 * Creates a runtime error with contextual information.
 */
export function createRuntimeError(
  message:
    string,
  options:
    RuntimeErrorOptions = {},
): RuntimeError {
  return new RuntimeError(
    message,
    options,
  );
}

/**
 * Normalizes an unknown value into an Error.
 */
function normalizeError(
  value:
    unknown,
):
  | Error
  | undefined {
  if (
    value instanceof
    Error
  ) {
    return value;
  }

  return undefined;
}
