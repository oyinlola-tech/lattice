/**
 * Client HTTP error factory functions (4xx).
 *
 * @module httpErrors/factories/client
 */

import type {
  HttpErrorOptions,
} from "../httpError.type.js";

import {
  HttpError,
} from "../httpError.base.js";

/**
 * Creates a 400 Bad Request error.
 */
export function badRequest(
  message?:
    | string,
  options?:
    | HttpErrorOptions,
):
  | HttpError {
  return new HttpError(
    400,
    message ??
      "Bad Request",
    {
      ...options,
      code:
        options?.code ??
        "BAD_REQUEST",
    },
  );
}

/**
 * Creates a 401 Unauthorized error.
 */
export function unauthorized(
  message?:
    | string,
  options?:
    | HttpErrorOptions,
):
  | HttpError {
  return new HttpError(
    401,
    message ??
      "Unauthorized",
    {
      ...options,
      code:
        options?.code ??
        "UNAUTHORIZED",
    },
  );
}

/**
 * Creates a 403 Forbidden error.
 */
export function forbidden(
  message?:
    | string,
  options?:
    | HttpErrorOptions,
):
  | HttpError {
  return new HttpError(
    403,
    message ??
      "Forbidden",
    {
      ...options,
      code:
        options?.code ??
        "FORBIDDEN",
    },
  );
}

/**
 * Creates a 404 Not Found error.
 */
export function notFound(
  message?:
    | string,
  options?:
    | HttpErrorOptions,
):
  | HttpError {
  return new HttpError(
    404,
    message ??
      "Not Found",
    {
      ...options,
      code:
        options?.code ??
        "NOT_FOUND",
    },
  );
}

/**
 * Creates a 405 Method Not Allowed error.
 */
export function methodNotAllowed(
  message?:
    | string,
  options?:
    | HttpErrorOptions,
):
  | HttpError {
  return new HttpError(
    405,
    message ??
      "Method Not Allowed",
    {
      ...options,
      code:
        options?.code ??
        "METHOD_NOT_ALLOWED",
    },
  );
}

/**
 * Creates a 409 Conflict error.
 */
export function conflict(
  message?:
    | string,
  options?:
    | HttpErrorOptions,
):
  | HttpError {
  return new HttpError(
    409,
    message ??
      "Conflict",
    {
      ...options,
      code:
        options?.code ??
        "CONFLICT",
    },
  );
}

/**
 * Creates a 422 Unprocessable Entity error.
 */
export function unprocessableEntity(
  message?:
    | string,
  options?:
    | HttpErrorOptions,
):
  | HttpError {
  return new HttpError(
    422,
    message ??
      "Unprocessable Entity",
    {
      ...options,
      code:
        options?.code ??
        "UNPROCESSABLE_ENTITY",
    },
  );
}

/**
 * Creates a 429 Too Many Requests error.
 */
export function tooManyRequests(
  message?:
    | string,
  options?:
    | HttpErrorOptions,
):
  | HttpError {
  return new HttpError(
    429,
    message ??
      "Too Many Requests",
    {
      ...options,
      code:
        options?.code ??
        "TOO_MANY_REQUESTS",
    },
  );
}
