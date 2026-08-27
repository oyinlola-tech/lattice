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
 * Options for creating an HTTP error.
 */
export interface HttpErrorOptions
  extends Omit<
    BaseErrorOptions,
    "statusCode"
  > {
  readonly statusCode: number;
}

/**
 * Error representing an HTTP failure.
 *
 * This class provides a common base for errors that need to expose
 * an HTTP status code to an API layer.
 */
export class HttpError
  extends BaseError {
  constructor(
    message: string,
    options: HttpErrorOptions,
  ) {
    super(
      message,
      {
        ...options,
        statusCode:
          options.statusCode,
        code:
          options.code ??
          ErrorCode.OPERATION_FAILED,
        category:
          options.category ??
          ErrorCategory.OPERATION,
        severity:
          options.severity ??
          inferSeverity(
            options.statusCode,
          ),
        expose:
          options.expose ??
          options.statusCode <
            500,
        isOperational:
          options.isOperational ??
          options.statusCode <
            500,
      },
    );
  }
}

/**
 * Creates an HTTP error.
 */
export function createHttpError(
  message: string,
  statusCode: number,
  options: Omit<
    HttpErrorOptions,
    "statusCode"
  > = {},
): HttpError {
  return new HttpError(
    message,
    {
      ...options,
      statusCode,
    },
  );
}

/**
 * Determines whether an unknown value is an HttpError.
 */
export function isHttpError(
  value: unknown,
): value is HttpError {
  return (
    value instanceof HttpError
  );
}

/**
 * Returns whether a status code represents a successful response.
 */
export function isHttpSuccessStatus(
  statusCode: number,
): boolean {
  return (
    statusCode >= 200 &&
    statusCode < 300
  );
}

/**
 * Returns whether a status code represents a redirect.
 */
export function isHttpRedirectStatus(
  statusCode: number,
): boolean {
  return (
    statusCode >= 300 &&
    statusCode < 400
  );
}

/**
 * Returns whether a status code represents a client error.
 */
export function isHttpClientErrorStatus(
  statusCode: number,
): boolean {
  return (
    statusCode >= 400 &&
    statusCode < 500
  );
}

/**
 * Returns whether a status code represents a server error.
 */
export function isHttpServerErrorStatus(
  statusCode: number,
): boolean {
  return (
    statusCode >= 500 &&
    statusCode < 600
  );
}

/**
 * Converts an HTTP status code into a default error severity.
 */
function inferSeverity(
  statusCode: number,
): ErrorSeverity {
  if (
    statusCode >= 500
  ) {
    return ErrorSeverity.ERROR;
  }

  if (
    statusCode === 429
  ) {
    return ErrorSeverity.WARNING;
  }

  if (
    statusCode >= 400
  ) {
    return ErrorSeverity.INFO;
  }

  return ErrorSeverity.INFO;
}