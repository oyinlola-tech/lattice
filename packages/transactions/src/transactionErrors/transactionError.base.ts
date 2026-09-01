/**
 * Base transaction error class.
 */

import {
  BaseError,
  ErrorCode,
  ErrorCategory,
  ErrorSeverity,
  type ErrorMetadata,
} from "@oyinlola141/lattice-errors";

/**
 * Base error for all transaction-related failures.
 */
export class TransactionError extends BaseError {
  constructor(
    message: string,
    options?: {
      readonly code?: ErrorCode;
      readonly metadata?: ErrorMetadata;
      readonly cause?: unknown;
    },
  ) {
    super(message, {
      code: options?.code ?? ErrorCode.OPERATION_FAILED,
      category: ErrorCategory.DATABASE,
      severity: ErrorSeverity.ERROR,
      metadata: options?.metadata,
      cause: options?.cause,
    });
  }
}
