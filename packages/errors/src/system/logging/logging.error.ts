import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";

import {
  ErrorCategory,
} from "../../base/types/errorCategory.type.js";

import {
  ErrorCode,
} from "../../base/types/errorCode.type.js";

import {
  ErrorSeverity,
} from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating a logging error.
 */
export interface LoggingErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
}

/**
 * Error raised by the logging subsystem.
 */
export class LoggingError extends BaseError {
  constructor(
    message: string,
    options: LoggingErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.LOGGING_FAILED,
        category:
          options.category ??
          ErrorCategory.LOGGING,
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
  }
}

/**
 * Creates a logging error.
 */
export function createLoggingError(
  message: string,
  options: LoggingErrorOptions = {},
): LoggingError {
  return new LoggingError(message, options);
}

/**
 * Determines whether an unknown value is a LoggingError.
 */
export function isLoggingError(
  value: unknown,
): value is LoggingError {
  return value instanceof LoggingError;
}
