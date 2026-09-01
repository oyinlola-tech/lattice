/**
 * HTTP error type guards.
 *
 * @module httpErrors/typeGuards
 */

import { HttpError } from "./httpError.base.js";

/**
 * Determines whether an unknown value is an HttpError.
 */
export function isHttpError(value: unknown): value is HttpError {
  return value instanceof HttpError;
}

/**
 * Determines whether an unknown value is a client error (4xx).
 */
export function isClientError(value: unknown): value is HttpError {
  return (
    value instanceof HttpError &&
    value.statusCode >= 400 &&
    value.statusCode < 500
  );
}

/**
 * Determines whether an unknown value is a server error (5xx).
 */
export function isServerError(value: unknown): value is HttpError {
  return (
    value instanceof HttpError &&
    value.statusCode >= 500 &&
    value.statusCode < 600
  );
}

/**
 * Determines whether a status code represents an error.
 */
export function isErrorStatus(status: number): boolean {
  return status >= 400 && status < 600;
}
