/**
 * Error transformation utilities — toError, withErrorContext, tryCatch, normalize.
 */

import { BaseError } from "../base/core/baseError.core.js";
import { ErrorCategory } from "../base/types/errorCategory.type.js";
import { ErrorSeverity } from "../base/types/errorSeverity.type.js";
import { getErrorMessage } from "./errorUtils.extraction.js";

/** Safely converts an unknown thrown value into an Error instance. */
export function toError(
  value: unknown,
  fallback = "An unexpected error occurred.",
): Error {
  if (value instanceof Error) {
    return value;
  }
  return new Error(getErrorMessage(value, fallback));
}

/** Adds context to an Error while preserving the original error as its cause. */
export function withErrorContext(error: unknown, context: string): Error {
  const original = toError(error);
  return new Error(`${context}: ${original.message}`, { cause: original });
}

/** Executes a function and converts thrown values into BaseError instances. */
export function tryCatch<T>(
  operation: () => T,
):
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: BaseError } {
  try {
    return { success: true, value: operation() };
  } catch (error) {
    return { success: false, error: normalizeToBaseError(error) };
  }
}

/** Async equivalent of tryCatch. */
export async function tryCatchAsync<T>(
  operation: () => T | Promise<T>,
): Promise<
  | { readonly success: true; readonly value: T }
  | { readonly success: false; readonly error: BaseError }
> {
  try {
    return { success: true, value: await operation() };
  } catch (error) {
    return { success: false, error: normalizeToBaseError(error) };
  }
}

/** Converts an unknown thrown value into a BaseError. */
export function normalizeToBaseError(value: unknown): BaseError {
  if (value instanceof BaseError) {
    return value;
  }

  if (value instanceof Error) {
    return new BaseError(value.message || "An unexpected error occurred.", {
      code: "INTERNAL_ERROR",
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.ERROR,
      statusCode: 500,
      expose: false,
      isOperational: false,
      cause: value,
    });
  }

  return new BaseError(getErrorMessage(value), {
    code: "INTERNAL_ERROR",
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.ERROR,
    statusCode: 500,
    expose: false,
    isOperational: false,
    metadata: { originalType: typeof value },
  });
}
