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
 * Options for creating a route pattern error.
 */
export interface RoutePatternErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly pattern?: string;
  readonly position?: number;
}

/**
 * Error thrown when a route pattern is invalid.
 */
export class RoutePatternError
  extends BaseError {
  /**
   * The route pattern that caused the error.
   */
  public readonly pattern: string;

  /**
   * The position in the pattern where the error occurred.
   */
  public readonly position:
    | number
    | undefined;

  constructor(
    message: string,
    options: RoutePatternErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.HTTP_ROUTE_PATTERN,
        category:
          options.category ??
          ErrorCategory.VALIDATION,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ?? 400,
        expose:
          options.expose ?? true,
      },
    );

    this.name =
      "RoutePatternError";

    this.pattern =
      options.pattern ?? "";

    this.position =
      options.position;
  }
}

/**
 * Error thrown when a duplicate parameter name is found in a route pattern.
 */
export class DuplicateRouteParameterError
  extends RoutePatternError {
  /**
   * The duplicate parameter name.
   */
  public readonly paramName: string;

  constructor(
    pattern: string,
    paramName: string,
  ) {
    super(
      `Duplicate parameter: ${paramName}`,
      {
        pattern,
        code:
          ErrorCode.HTTP_DUPLICATE_ROUTE_PARAM,
        metadata: {
          paramName,
        },
      },
    );

    this.name =
      "DuplicateRouteParameterError";

    this.paramName =
      paramName;
  }
}

/**
 * Creates a route pattern error.
 */
export function createRoutePatternError(
  message: string,
  options: RoutePatternErrorOptions = {},
): RoutePatternError {
  return new RoutePatternError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is a RoutePatternError.
 */
export function isRoutePatternError(
  value: unknown,
): value is RoutePatternError {
  return value instanceof RoutePatternError;
}
