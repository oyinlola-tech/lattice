import { BaseError } from "../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../base/types/baseError.type.js";

import {
  ErrorCategory,
} from "../base/types/errorCategory.type.js";

import {
  ErrorCode,
} from "../base/types/errorCode.type.js";

import {
  ErrorSeverity,
} from "../base/types/errorSeverity.type.js";

/**
 * Options for creating a runtime error.
 */
export interface RuntimeErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly phase?: string;
  readonly component?: string;
}

/**
 * Base error for all runtime subsystem failures.
 */
export class RuntimeError extends BaseError {
  public readonly phase?: string;
  public readonly component?: string;

  constructor(
    message: string,
    options: RuntimeErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.SYSTEM_ERROR,
        category:
          options.category ??
          ErrorCategory.RUNTIME,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ?? 500,
        expose:
          options.expose ?? false,
        isOperational:
          options.isOperational ?? true,
      },
    );

    this.phase = options.phase;
    this.component = options.component;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.phase !== undefined
        ? { phase: this.phase }
        : {}),
      ...(this.component !== undefined
        ? { component: this.component }
        : {}),
    };
  }
}

/**
 * Creates a runtime error.
 */
export function createRuntimeError(
  message: string,
  options: RuntimeErrorOptions = {},
): RuntimeError {
  return new RuntimeError(message, options);
}

/**
 * Determines whether an unknown value is a RuntimeError.
 */
export function isRuntimeError(
  value: unknown,
): value is RuntimeError {
  return value instanceof RuntimeError;
}

/**
 * Error thrown during runtime bootstrap.
 */
export class RuntimeBootstrapError
  extends RuntimeError {
  constructor(
    message?: string,
    cause?: unknown,
  ) {
    super(
      message ??
        "Runtime bootstrap failed.",
      {
        code:
          ErrorCode.RUNTIME_BOOTSTRAP,
        phase: "bootstrap",
        cause,
        isOperational: false,
      },
    );
  }
}

/**
 * Error thrown during runtime shutdown.
 */
export class RuntimeShutdownError
  extends RuntimeError {
  constructor(
    message?: string,
    cause?: unknown,
  ) {
    super(
      message ??
        "Runtime shutdown failed.",
      {
        code:
          ErrorCode.RUNTIME_SHUTDOWN,
        phase: "shutdown",
        cause,
        isOperational: false,
      },
    );
  }
}

/**
 * Error thrown for invalid runtime state transitions.
 */
export class RuntimeStateError
  extends RuntimeError {
  constructor(
    message: string,
    cause?: unknown,
  ) {
    super(message, {
      code: ErrorCode.RUNTIME_STATE,
      phase: "state",
      cause,
      isOperational: false,
    });
  }
}

/**
 * Error thrown for runtime environment issues.
 */
export class RuntimeEnvironmentError
  extends RuntimeError {
  constructor(
    message: string,
    cause?: unknown,
  ) {
    super(message, {
      code:
        ErrorCode.RUNTIME_ENVIRONMENT,
      phase: "environment",
      cause,
      isOperational: false,
    });
  }
}

/**
 * Error thrown for runtime manager issues.
 */
export class RuntimeManagerError
  extends RuntimeError {
  constructor(
    message: string,
    cause?: unknown,
  ) {
    super(message, {
      code: ErrorCode.RUNTIME_MANAGER,
      phase: "manager",
      cause,
      isOperational: false,
    });
  }
}
