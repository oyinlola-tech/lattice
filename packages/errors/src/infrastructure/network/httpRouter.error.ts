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
 * Options for creating an HTTP router error.
 */
export interface HttpRouterErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
}

/**
 * Base error class for HTTP router errors.
 */
export class HttpRouterError extends BaseError {
  constructor(
    message: string,
    options: HttpRouterErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.HTTP_ROUTER,
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
      "HttpRouterError";
  }
}

/**
 * Error thrown when a route conflicts with an existing route.
 */
export class RouteConflictError
  extends HttpRouterError {
  /**
   * The route path that conflicts.
   */
  public readonly path: string;

  /**
   * The HTTP method that conflicts.
   */
  public readonly method: string;

  constructor(
    path: string,
    method: string,
  ) {
    super(
      `A route for ${method} ${path} is already registered.`,
      {
        code:
          ErrorCode.HTTP_ROUTE_CONFLICT,
        metadata: {
          path,
          method,
        },
      },
    );

    this.name =
      "RouteConflictError";

    this.path =
      path;

    this.method =
      method;
  }
}

/**
 * Error thrown when a route pattern is invalid.
 */
export class InvalidRoutePatternError
  extends HttpRouterError {
  /**
   * The invalid route pattern.
   */
  public readonly pattern: string;

  constructor(
    pattern: string,
    message: string,
  ) {
    super(
      `Invalid route pattern "${pattern}": ${message}`,
      {
        code:
          ErrorCode.HTTP_INVALID_ROUTE_PATTERN,
        metadata: {
          pattern,
        },
      },
    );

    this.name =
      "InvalidRoutePatternError";

    this.pattern =
      pattern;
  }
}

/**
 * Creates an HTTP router error.
 */
export function createHttpRouterError(
  message: string,
  options: HttpRouterErrorOptions = {},
): HttpRouterError {
  return new HttpRouterError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is an HttpRouterError.
 */
export function isHttpRouterError(
  value: unknown,
): value is HttpRouterError {
  return value instanceof HttpRouterError;
}
