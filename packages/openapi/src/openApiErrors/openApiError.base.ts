/**
 * Base OpenAPI error and factory functions.
 */

import {
  BaseError,
  ErrorCode,
  ErrorCategory,
  ErrorSeverity,
} from "@oyinlola141/lattice-errors";

/** Options for creating an OpenAPI error. */
export interface OpenAPIErrorOptions {
  readonly code?: string;
  readonly statusCode?: number;
  readonly expose?: boolean;
  readonly cause?: unknown;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Base error for all OpenAPI subsystem failures. */
export class OpenAPIError extends BaseError {
  constructor(message: string, options: OpenAPIErrorOptions = {}) {
    super(message, {
      code: (options.code as ErrorCode) ?? ErrorCode.OPENAPI_DOCUMENT,
      category: ErrorCategory.OPENAPI,
      severity: ErrorSeverity.ERROR,
      statusCode: options.statusCode ?? 500,
      expose: options.expose ?? false,
      cause: options.cause,
      metadata: options.metadata as
        import("@oyinlola141/lattice-errors").ErrorMetadata | undefined,
    });
    this.name = "OpenAPIError";
  }
}

/** Creates an OpenAPI error. */
export function createOpenAPIError(
  message: string,
  options: OpenAPIErrorOptions = {},
): OpenAPIError {
  return new OpenAPIError(message, options);
}

/** Determines whether an unknown value is an OpenAPI error. */
export function isOpenAPIError(value: unknown): value is OpenAPIError {
  return value instanceof OpenAPIError;
}
