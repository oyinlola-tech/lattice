/**
 * HTTP server error classes (5xx status codes).
 *
 * These errors carry enough information for the HTTP layer to translate
 * failures into consistent responses without coupling the errors to a
 * particular server adapter.
 */

import { HttpError } from "./http.error.js";
import type { ErrorMetadata } from "../../base/core/errorMetadata.core.js";

/**
 * Options for creating an HTTP server error.
 */
export interface HttpServerErrorOptions {
  readonly cause?: unknown;
  readonly code?: string;
  readonly expose?: boolean;
  readonly metadata?: ErrorMetadata;
}

/**
 * 500 Internal Server Error
 */
export class InternalServerError extends HttpError {
  constructor(
    message: string = "Internal Server Error",
    options: HttpServerErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 500,
      code: options.code ?? "INTERNAL_SERVER_ERROR",
      expose: options.expose ?? false,
    });
    this.name = "InternalServerError";
  }
}

/**
 * 501 Not Implemented
 */
export class NotImplementedError extends HttpError {
  constructor(
    message: string = "Not Implemented",
    options: HttpServerErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 501,
      code: options.code ?? "NOT_IMPLEMENTED",
      expose: options.expose ?? false,
    });
    this.name = "NotImplementedError";
  }
}

/**
 * 502 Bad Gateway
 */
export class BadGatewayError extends HttpError {
  constructor(
    message: string = "Bad Gateway",
    options: HttpServerErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 502,
      code: options.code ?? "BAD_GATEWAY",
      expose: options.expose ?? false,
    });
    this.name = "BadGatewayError";
  }
}

/**
 * 503 Service Unavailable
 */
export class ServiceUnavailableError extends HttpError {
  constructor(
    message: string = "Service Unavailable",
    options: HttpServerErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 503,
      code: options.code ?? "SERVICE_UNAVAILABLE",
      expose: options.expose ?? false,
    });
    this.name = "ServiceUnavailableError";
  }
}

/**
 * 504 Gateway Timeout
 */
export class GatewayTimeoutError extends HttpError {
  constructor(
    message: string = "Gateway Timeout",
    options: HttpServerErrorOptions = {},
  ) {
    super(message, {
      ...options,
      statusCode: 504,
      code: options.code ?? "GATEWAY_TIMEOUT",
      expose: options.expose ?? false,
    });
    this.name = "GatewayTimeoutError";
  }
}
