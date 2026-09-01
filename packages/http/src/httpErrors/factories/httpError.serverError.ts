/**
 * Server HTTP error factory functions (5xx).
 *
 * @module httpErrors/factories/server
 */

import type { HttpErrorOptions } from "../httpError.type.js";

import { HttpError } from "../httpError.base.js";

/**
 * Creates a 500 Internal Server Error.
 */
export function internalServerError(
  message?: string,
  options?: HttpErrorOptions,
): HttpError {
  return new HttpError(500, message ?? "Internal Server Error", {
    ...options,
    code: options?.code ?? "INTERNAL_SERVER_ERROR",
  });
}

/**
 * Creates a 501 Not Implemented error.
 */
export function notImplemented(
  message?: string,
  options?: HttpErrorOptions,
): HttpError {
  return new HttpError(501, message ?? "Not Implemented", {
    ...options,
    code: options?.code ?? "NOT_IMPLEMENTED",
  });
}

/**
 * Creates a 502 Bad Gateway error.
 */
export function badGateway(
  message?: string,
  options?: HttpErrorOptions,
): HttpError {
  return new HttpError(502, message ?? "Bad Gateway", {
    ...options,
    code: options?.code ?? "BAD_GATEWAY",
  });
}

/**
 * Creates a 503 Service Unavailable error.
 */
export function serviceUnavailable(
  message?: string,
  options?: HttpErrorOptions,
): HttpError {
  return new HttpError(503, message ?? "Service Unavailable", {
    ...options,
    code: options?.code ?? "SERVICE_UNAVAILABLE",
  });
}

/**
 * Creates a 504 Gateway Timeout error.
 */
export function gatewayTimeout(
  message?: string,
  options?: HttpErrorOptions,
): HttpError {
  return new HttpError(504, message ?? "Gateway Timeout", {
    ...options,
    code: options?.code ?? "GATEWAY_TIMEOUT",
  });
}
