/**
 * Base SystemError class, options, and factory functions.
 */

import { BaseError } from "../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../base/types/baseError.type.js";
import { ErrorCategory } from "../base/types/errorCategory.type.js";
import { ErrorCode } from "../base/types/errorCode.type.js";
import { ErrorSeverity } from "../base/types/errorSeverity.type.js";

/** System operation types used for diagnostics. */
export enum SystemOperation {
  UNKNOWN = "unknown",
  INITIALIZATION = "initialization",
  STARTUP = "startup",
  SHUTDOWN = "shutdown",
  CONFIGURATION = "configuration",
  HEALTH_CHECK = "health_check",
}

/** Options for creating a system error. */
export interface SystemErrorOptions extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly operation?: SystemOperation;
}

/** Error raised when a system-level operation fails. */
export class SystemError extends BaseError {
  public readonly operation: SystemOperation;

  constructor(
    message = "A system operation failed.",
    options: SystemErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.SYSTEM_ERROR,
      category: options.category ?? ErrorCategory.SYSTEM,
      severity: options.severity ?? ErrorSeverity.ERROR,
      statusCode: options.statusCode ?? 500,
      expose: options.expose ?? false,
      isOperational: options.isOperational ?? true,
      metadata: {
        ...options.metadata,
        ...(options.operation !== undefined
          ? { operation: options.operation }
          : {}),
      },
    });
    this.operation = options.operation ?? SystemOperation.UNKNOWN;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
    };
  }
}

/** Creates a system error. */
export function createSystemError(
  message = "A system operation failed.",
  options: SystemErrorOptions = {},
): SystemError {
  return new SystemError(message, options);
}

/** Determines whether an unknown value is a SystemError. */
export function isSystemError(value: unknown): value is SystemError {
  return value instanceof SystemError;
}
