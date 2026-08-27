import type { ErrorCategory } from "../types/errorCategory.type.js";
import { ErrorCode } from "../types/errorCode.type.js";
import type { ErrorSeverity } from "../types/errorSeverity.type.js";
import { BaseError } from "../core/baseError.core.js";
import type { BaseErrorOptions } from "../types/baseError.type.js";

/**
 * Determines whether an unknown value is a BaseError.
 */
export function isBaseError(value: unknown): value is BaseError {
  return value instanceof BaseError;
}

/**
 * Converts an unknown thrown value into a BaseError.
 */
export function toBaseError(
  error: unknown,
  options: BaseErrorOptions = {},
): BaseError {
  if (error instanceof BaseError) return error;

  if (error instanceof Error) {
    return new BaseError(options.message ?? error.message, {
      ...options,
      cause: options.cause ?? error,
    });
  }

  return new BaseError(
    options.message ?? "An unknown error occurred.",
    { ...options, cause: options.cause ?? error },
  );
}

/**
 * Extracts an error code from an unknown error.
 */
export function getErrorCode(
  error: unknown,
): ErrorCode | string {
  if (error instanceof BaseError) return error.code;
  return ErrorCode.UNKNOWN;
}

/**
 * Extracts an error category from an unknown error.
 */
export function getErrorCategory(error: unknown): ErrorCategory {
  if (error instanceof BaseError) return error.category;
  return "UNKNOWN" as ErrorCategory;
}

/**
 * Extracts an error severity from an unknown error.
 */
export function getErrorSeverity(error: unknown): ErrorSeverity {
  if (error instanceof BaseError) return error.severity;
  return "ERROR" as ErrorSeverity;
}

/**
 * Extracts a status code from an unknown error.
 */
export function getErrorStatusCode(error: unknown): number {
  if (error instanceof BaseError) return error.statusCode;
  return 500;
}

/**
 * Determines whether an unknown error is safe to expose.
 */
export function isErrorExposable(error: unknown): boolean {
  if (error instanceof BaseError) return error.expose;
  return false;
}

/**
 * Determines whether an unknown value represents an Error.
 */
export function isError(value: unknown): value is Error {
  return value instanceof Error;
}
