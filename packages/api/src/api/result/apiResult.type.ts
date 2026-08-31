import type { APIError } from "../errors/index.js";

/**
 * Success result from an API operation.
 */
export interface APISuccess<T> {
  readonly ok: true;
  readonly data: T;
}

/**
 * Failure result from an API operation.
 */
export interface APIFailure {
  readonly ok: false;
  readonly error: APIError;
}

/**
 * Discriminated result type for API operations.
 */
export type APIResult<T> = APISuccess<T> | APIFailure;

/**
 * Creates a successful API result.
 */
export function apiSuccess<T>(
  data: T,
): APISuccess<T> {
  return Object.freeze({ ok: true, data });
}

/**
 * Creates a failed API result.
 */
export function apiFailure(
  error: APIError,
): APIFailure {
  return Object.freeze({ ok: false, error });
}

/**
 * Determines whether an API result is successful.
 */
export function isApiSuccess<T>(
  result: APIResult<T>,
): result is APISuccess<T> {
  return result.ok === true;
}

/**
 * Determines whether an API result is a failure.
 */
export function isApiFailure<T>(
  result: APIResult<T>,
): result is APIFailure {
  return result.ok === false;
}
