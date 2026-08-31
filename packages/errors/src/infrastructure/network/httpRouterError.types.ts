import { ErrorCode } from "../../base/types/errorCode.type.js";
import { HttpRouterError } from "./httpRouterError.base.js";

/**
 * Error thrown when a route conflicts with an existing route.
 */
export class RouteConflictError extends HttpRouterError {
  /** The route path that conflicts. */
  public readonly path: string;

  /** The HTTP method that conflicts. */
  public readonly method: string;

  constructor(path: string, method: string) {
    super(`A route for ${method} ${path} is already registered.`, {
      code: ErrorCode.HTTP_ROUTE_CONFLICT,
      metadata: { path, method },
    });

    this.name = "RouteConflictError";
    this.path = path;
    this.method = method;
  }
}

/**
 * Error thrown when a route pattern is invalid.
 */
export class InvalidRoutePatternError extends HttpRouterError {
  /** The invalid route pattern. */
  public readonly pattern: string;

  constructor(pattern: string, message: string) {
    super(`Invalid route pattern "${pattern}": ${message}`, {
      code: ErrorCode.HTTP_INVALID_ROUTE_PATTERN,
      metadata: { pattern },
    });

    this.name = "InvalidRoutePatternError";
    this.pattern = pattern;
  }
}
