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
 * Options for creating an application error.
 */
export interface ApplicationErrorOptions
  extends Omit<
    BaseErrorOptions,
    "category"
  > {
  readonly category?: ErrorCategory;
}

/**
 * General application-level error.
 *
 * This is the standard error to use when an operation fails because
 * of an expected application condition that does not fit a more
 * specific error type.
 */
export class ApplicationError
  extends BaseError {
  constructor(
    message: string,
    options: ApplicationErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.OPERATION_FAILED,
        category:
          options.category ??
          ErrorCategory.OPERATION,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ??
          500,
        isOperational:
          options.isOperational ??
          true,
      },
    );
  }
}

/**
 * Creates an application error.
 */
export function createApplicationError(
  message: string,
  options: ApplicationErrorOptions = {},
): ApplicationError {
  return new ApplicationError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is an ApplicationError.
 */
export function isApplicationError(
  value: unknown,
): value is ApplicationError {
  return (
    value instanceof ApplicationError
  );
}