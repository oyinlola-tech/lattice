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
 * System-level operation types used for diagnostics.
 */
export enum SystemOperation {
  UNKNOWN = "unknown",
  STARTUP = "startup",
  SHUTDOWN = "shutdown",
  INITIALIZATION = "initialization",
  RESOURCE = "resource",
  PROCESS = "process",
  SIGNAL = "signal",
  FILESYSTEM = "filesystem",
  MEMORY = "memory",
  INTERNAL = "internal",
}

/**
 * Options for creating a system error.
 */
export interface SystemErrorOptions
  extends Omit<
    BaseErrorOptions,
    "category"
  > {
  readonly category?: ErrorCategory;

  /**
   * System operation that failed.
   */
  readonly operation?: SystemOperation;

  /**
   * Name of the affected subsystem or component.
   */
  readonly component?: string;
}

/**
 * Error raised by an operating-system or application-runtime
 * subsystem.
 */
export class SystemError
  extends BaseError {
  public readonly operation: SystemOperation;

  public readonly component?: string;

  constructor(
    message =
      "A system operation failed.",
    options: SystemErrorOptions = {},
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
          ErrorCategory.SYSTEM,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ??
          500,
        expose:
          options.expose ??
          false,
        isOperational:
          options.isOperational ??
          false,
        metadata: {
          ...options.metadata,
          ...(options.operation !==
          undefined
            ? {
                operation:
                  options.operation,
              }
            : {}),
          ...(options.component !==
          undefined
            ? {
                component:
                  options.component,
              }
            : {}),
        },
      },
    );

    this.operation =
      options.operation ??
      SystemOperation.UNKNOWN;

    this.component =
      options.component;
  }

  /**
   * Returns a serialized representation with system diagnostics.
   */
  public override toJSON() {
    return {
      ...super.toJSON(),
      operation:
        this.operation,
      ...(this.component !==
      undefined
        ? {
            component:
              this.component,
          }
        : {}),
    };
  }
}

/**
 * Creates a system error.
 */
export function createSystemError(
  message =
    "A system operation failed.",
  options: SystemErrorOptions = {},
): SystemError {
  return new SystemError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is a SystemError.
 */
export function isSystemError(
  value: unknown,
): value is SystemError {
  return (
    value instanceof SystemError
  );
}

/**
 * Creates a system initialization error.
 */
export function systemInitializationError(
  component?: string,
  cause?: unknown,
): SystemError {
  return new SystemError(
    component
      ? `Failed to initialize ${component}.`
      : "System initialization failed.",
    {
      code:
        ErrorCode.SYSTEM_INITIALIZATION,
      operation:
        SystemOperation.INITIALIZATION,
      component,
      cause,
      isOperational:
        false,
      severity:
        ErrorSeverity.CRITICAL,
    },
  );
}

/**
 * Creates a system startup error.
 */
export function systemStartupError(
  component?: string,
  cause?: unknown,
): SystemError {
  return new SystemError(
    component
      ? `Failed to start ${component}.`
      : "System startup failed.",
    {
      code:
        ErrorCode.SYSTEM_STARTUP,
      operation:
        SystemOperation.STARTUP,
      component,
      cause,
      isOperational:
        false,
      severity:
        ErrorSeverity.CRITICAL,
    },
  );
}

/**
 * Creates a system shutdown error.
 */
export function systemShutdownError(
  component?: string,
  cause?: unknown,
): SystemError {
  return new SystemError(
    component
      ? `Failed to shut down ${component}.`
      : "System shutdown failed.",
    {
      code:
        ErrorCode.SYSTEM_SHUTDOWN,
      operation:
        SystemOperation.SHUTDOWN,
      component,
      cause,
      isOperational:
        false,
      severity:
        ErrorSeverity.CRITICAL,
    },
  );
}

/**
 * Creates an internal system error.
 */
export function internalSystemError(
  message =
    "An internal system error occurred.",
  cause?: unknown,
): SystemError {
  return new SystemError(
    message,
    {
      code:
        ErrorCode.INTERNAL_ERROR,
      operation:
        SystemOperation.INTERNAL,
      cause,
      isOperational:
        false,
      expose:
        false,
      severity:
        ErrorSeverity.CRITICAL,
    },
  );
}