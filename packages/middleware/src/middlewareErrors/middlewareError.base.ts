/**
 * Middleware-specific error classes.
 *
 * @module middlewareErrors
 */

import { BaseError, ErrorCode, ErrorCategory, ErrorSeverity } from "@oyinlola141/lattice-errors";

/**
 * Error thrown when a middleware pipeline fails.
 */
export class MiddlewareError extends BaseError {
  constructor(
    message: string,
    options?: {
      readonly middlewareName?: string;
      readonly cause?: unknown;
    },
  ) {
    super(message, {
      code: ErrorCode.OPERATION_FAILED,
      category: ErrorCategory.INTERNAL,
      severity: ErrorSeverity.ERROR,
      metadata: {
        middlewareName: options?.middlewareName,
      },
      cause: options?.cause,
    });
  }
}

/**
 * Error thrown when a middleware exceeds its timeout.
 */
export class MiddlewareTimeoutError extends MiddlewareError {
  constructor(
    middlewareName: string,
    timeoutMs: number,
  ) {
    super(`Middleware "${middlewareName}" timed out after ${timeoutMs}ms`, {
      middlewareName,
    });
  }
}

/**
 * Error thrown when a middleware calls next() multiple times.
 */
export class MiddlewareNextCalledMultipleTimesError extends MiddlewareError {
  constructor(middlewareName: string) {
    super(`Middleware "${middlewareName}" called next() multiple times`, {
      middlewareName,
    });
  }
}
