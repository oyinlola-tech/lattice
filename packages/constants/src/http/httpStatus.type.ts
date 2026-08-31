/**
 * HTTP status code constants and category helpers.
 *
 * @module http/httpStatus
 */

/** Type-safe HTTP status code number. */
export type HttpStatusCode = number;

/**
 * Standard HTTP status codes organized by category.
 */
export const HttpStatus = Object.freeze({
  // 2xx Success
  OK: 200,
  CREATED: 201,
  ACCEPTED: 202,
  NO_CONTENT: 204,
  RESET_CONTENT: 205,
  PARTIAL_CONTENT: 206,

  // 3xx Redirection
  MOVED_PERMANENTLY: 301,
  FOUND: 302,
  NOT_MODIFIED: 304,
  TEMPORARY_REDIRECT: 307,
  PERMANENT_REDIRECT: 308,

  // 4xx Client Error
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  NOT_ACCEPTABLE: 406,
  CONFLICT: 409,
  GONE: 410,
  UNPROCESSABLE_ENTITY: 422,
  TOO_MANY_REQUESTS: 429,

  // 5xx Server Error
  INTERNAL_SERVER_ERROR: 500,
  NOT_IMPLEMENTED: 501,
  BAD_GATEWAY: 502,
  SERVICE_UNAVAILABLE: 503,
  GATEWAY_TIMEOUT: 504,
} as const);

/**
 * Check whether a status code is in the 2xx success range.
 */
export function isSuccessStatus(code: number): boolean {
  return code >= 200 && code < 300;
}

/**
 * Check whether a status code is in the 3xx redirection range.
 */
export function isRedirectStatus(code: number): boolean {
  return code >= 300 && code < 400;
}

/**
 * Check whether a status code is in the 4xx client error range.
 */
export function isClientError(code: number): boolean {
  return code >= 400 && code < 500;
}

/**
 * Check whether a status code is in the 5xx server error range.
 */
export function isServerError(code: number): boolean {
  return code >= 500 && code < 600;
}

/**
 * Check whether a status code represents any error (4xx or 5xx).
 */
export function isErrorStatus(code: number): boolean {
  return isClientError(code) || isServerError(code);
}
