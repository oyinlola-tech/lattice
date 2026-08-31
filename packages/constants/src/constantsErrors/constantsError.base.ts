/**
 * Error classes specific to the constants package.
 *
 * @module constantsErrors
 */

import {
  BaseError,
  ErrorCode,
  ErrorCategory,
  ErrorSeverity,
  type ErrorMetadata,
} from "@lattice/errors";

/**
 * Error thrown when an invalid constant value is used.
 */
export class InvalidConstantError extends BaseError {
  constructor(
    message: string,
    options?: {
      readonly code?: ErrorCode;
      readonly metadata?: ErrorMetadata;
    },
  ) {
    super(message, {
      code: options?.code ?? ErrorCode.CONFIGURATION_INVALID,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.ERROR,
      metadata: options?.metadata,
    });
  }
}

/**
 * Error thrown when a constant is used outside its valid context.
 */
export class ConstantContextError extends BaseError {
  constructor(
    message: string,
    options?: {
      readonly metadata?: ErrorMetadata;
    },
  ) {
    super(message, {
      code: ErrorCode.INVALID_INPUT,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.ERROR,
      metadata: options?.metadata,
    });
  }
}
