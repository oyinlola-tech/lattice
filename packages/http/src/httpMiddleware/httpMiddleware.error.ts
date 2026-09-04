/**
 * HTTP middleware error types.
 *
 * Extends the shared MiddlewareError from @zudojs/errors with
 * HTTP-specific middleware error information.
 *
 * @module httpMiddleware/errors
 */

import { BaseError } from "@zudojs/errors";

/* -------------------------------------------------------------------------- */
/* Errors                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Error raised by an HTTP middleware function.
 */
export class HttpMiddlewareError extends BaseError {
  /**
   * The unique identifier of the middleware.
   */
  readonly middlewareId: string | undefined;

  /**
   * The name of the middleware.
   */
  readonly middlewareName: string | undefined;

  constructor(
    message: string,
    options: {
      readonly middlewareId?: string;

      readonly middlewareName?: string;

      readonly cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: "HTTP_MIDDLEWARE_ERROR",

      statusCode: 500,

      expose: false,

      cause: options.cause,
    });

    this.name = "HttpMiddlewareError";

    this.middlewareId = options.middlewareId;

    this.middlewareName = options.middlewareName;
  }
}

/**
 * Error raised when the HTTP middleware pipeline fails.
 */
export class HttpMiddlewarePipelineError extends BaseError {
  /**
   * The errors that occurred during pipeline execution.
   */
  readonly errors: readonly HttpMiddlewareError[];

  constructor(errors: readonly HttpMiddlewareError[]) {
    const message =
      errors.length === 1
        ? `HTTP middleware pipeline failed: ${errors[0]?.message ?? "Unknown error"}`
        : `HTTP middleware pipeline failed with ${errors.length} errors: ${errors
            .map((e) => e.message)
            .join(", ")}`;

    super(message, {
      code: "MIDDLEWARE_PIPELINE_ERROR",

      statusCode: 500,

      expose: false,
    });

    this.name = "HttpMiddlewarePipelineError";

    this.errors = Object.freeze([...errors]);
  }
}
