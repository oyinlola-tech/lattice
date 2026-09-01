import type { RuntimeErrorOptions } from "./runtimeError.type.js";

import { RuntimeErrorCode } from "./runtimeError.type.js";

import { RuntimeError } from "./runtimeError.base.js";

/**
 * Error thrown when runtime state transitions are invalid.
 */
export class RuntimeStateError extends RuntimeError {
  public readonly from:
    import("./runtimeError.type.js").RuntimeErrorPhase | string;
  public readonly to:
    import("./runtimeError.type.js").RuntimeErrorPhase | string;

  public constructor(
    from: import("./runtimeError.type.js").RuntimeErrorPhase | string,
    to: import("./runtimeError.type.js").RuntimeErrorPhase | string,
    options: Omit<RuntimeErrorOptions, "code"> = {},
  ) {
    super(`Invalid runtime state transition from "${from}" to "${to}".`, {
      ...options,
      code: RuntimeErrorCode.INVALID_STATE_TRANSITION,
      operation: options.operation ?? "run",
      metadata: {
        ...(options.metadata ?? {}),
        from,
        to,
      },
    });

    this.name = "RuntimeStateError";
    this.from = from;
    this.to = to;
  }
}

/**
 * Error thrown when runtime startup fails.
 */
export class RuntimeStartError extends RuntimeError {
  public constructor(
    message: string,
    options: Omit<RuntimeErrorOptions, "operation"> = {},
  ) {
    super(message, {
      ...options,
      operation: "start",
      code: options.code ?? RuntimeErrorCode.BOOTSTRAP_FAILED,
    });

    this.name = "RuntimeStartError";
  }
}

/**
 * Error thrown when runtime shutdown fails.
 */
export class RuntimeStopError extends RuntimeError {
  public constructor(
    message: string,
    options: Omit<RuntimeErrorOptions, "operation"> = {},
  ) {
    super(message, {
      ...options,
      operation: "stop",
      code: options.code ?? RuntimeErrorCode.SHUTDOWN_FAILED,
    });

    this.name = "RuntimeStopError";
  }
}

/**
 * Error thrown when runtime initialization fails.
 */
export class RuntimeInitializationError extends RuntimeError {
  public constructor(
    message: string,
    options: Omit<RuntimeErrorOptions, "operation"> = {},
  ) {
    super(message, {
      ...options,
      operation: "initialize",
      code: options.code ?? RuntimeErrorCode.MODULE_INITIALIZATION_FAILED,
    });

    this.name = "RuntimeInitializationError";
  }
}

/**
 * Error thrown when runtime loading fails.
 */
export class RuntimeLoadError extends RuntimeError {
  public constructor(
    message: string,
    options: Omit<RuntimeErrorOptions, "operation"> = {},
  ) {
    super(message, {
      ...options,
      operation: "load",
      code: options.code ?? RuntimeErrorCode.MODULE_LOAD_FAILED,
    });

    this.name = "RuntimeLoadError";
  }
}
