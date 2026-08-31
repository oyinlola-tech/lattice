import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";

import {
  ErrorCode,
} from "../../base/types/errorCode.type.js";

import {
  ErrorCategory,
} from "../../base/types/errorCategory.type.js";

import {
  ErrorSeverity,
} from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating an HTTP server lifecycle error.
 */
export interface HttpServerLifecycleErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
}

/**
 * Base error class for HTTP server lifecycle errors.
 */
export class HttpServerLifecycleError
  extends BaseError {
  constructor(
    message: string,
    options: HttpServerLifecycleErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.HTTP_SERVER,
        category:
          options.category ??
          ErrorCategory.NETWORK,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ?? 500,
        expose:
          options.expose ?? false,
      },
    );

    this.name =
      "HttpServerLifecycleError";
  }
}

/**
 * Error thrown when an HTTP server operation is attempted in an invalid state.
 */
export class InvalidHttpServerStateError
  extends HttpServerLifecycleError {
  /**
   * The current server state.
   */
  public readonly state: string;

  constructor(
    state: string,
    operation: string,
  ) {
    super(
      `Cannot ${operation} HTTP server while it is in "${state}" state.`,
      {
        code:
          ErrorCode.HTTP_SERVER_INVALID_STATE,
        metadata: {
          state,
          operation,
        },
      },
    );

    this.name =
      "InvalidHttpServerStateError";

    this.state =
      state;
  }
}

/**
 * Error thrown when an HTTP server fails to start.
 */
export class HttpServerStartError
  extends HttpServerLifecycleError {
  constructor(
    message: string,
    cause?: unknown,
  ) {
    super(
      message,
      {
        code:
          ErrorCode.HTTP_SERVER_START,
        cause,
      },
    );

    this.name =
      "HttpServerStartError";
  }
}

/**
 * Error thrown when an HTTP server fails to stop.
 */
export class HttpServerStopError
  extends HttpServerLifecycleError {
  constructor(
    message: string,
    cause?: unknown,
  ) {
    super(
      message,
      {
        code:
          ErrorCode.HTTP_SERVER_STOP,
        cause,
      },
    );

    this.name =
      "HttpServerStopError";
  }
}

/**
 * Creates an HTTP server lifecycle error.
 */
export function createHttpServerLifecycleError(
  message: string,
  options: HttpServerLifecycleErrorOptions = {},
): HttpServerLifecycleError {
  return new HttpServerLifecycleError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is an HttpServerLifecycleError.
 */
export function isHttpServerLifecycleError(
  value: unknown,
): value is HttpServerLifecycleError {
  return value instanceof HttpServerLifecycleError;
}
