import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";

import {
  ErrorCategory,
} from "../../base/types/errorCategory.type.js";

import {
  ErrorCode,
} from "../../base/types/errorCode.type.js";

import {
  ErrorSeverity,
} from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating an authorization error.
 */
export interface AuthorizationErrorOptions
  extends Omit<
    BaseErrorOptions,
    "category"
  > {
  readonly category?: ErrorCategory;
}

/**
 * Error raised when an authenticated principal is not permitted
 * to perform an operation or access a resource.
 */
export class AuthorizationError
  extends BaseError {
  constructor(
    message =
      "You are not authorized to perform this operation.",
    options: AuthorizationErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.FORBIDDEN,
        category:
          options.category ??
          ErrorCategory.AUTHORIZATION,
        severity:
          options.severity ??
          ErrorSeverity.WARNING,
        statusCode:
          options.statusCode ??
          403,
        expose:
          options.expose ??
          true,
        isOperational:
          options.isOperational ??
          true,
      },
    );
  }
}

/**
 * Creates an authorization error.
 */
export function createAuthorizationError(
  message =
    "You are not authorized to perform this operation.",
  options: AuthorizationErrorOptions = {},
): AuthorizationError {
  return new AuthorizationError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is an AuthorizationError.
 */
export function isAuthorizationError(
  value: unknown,
): value is AuthorizationError {
  return (
    value instanceof AuthorizationError
  );
}

/**
 * Creates an authorization error for denied access.
 */
export function accessDeniedError(
  message =
    "Access denied.",
): AuthorizationError {
  return new AuthorizationError(
    message,
    {
      code:
        ErrorCode.ACCESS_DENIED,
      category:
        ErrorCategory.AUTHORIZATION,
      statusCode:
        403,
      expose:
        true,
    },
  );
}

/**
 * Creates an authorization error for a missing permission.
 */
export function permissionDeniedError(
  permission?: string,
): AuthorizationError {
  const message =
    permission
      ? `Permission denied: ${permission}.`
      : "Permission denied.";

  return new AuthorizationError(
    message,
    {
      code:
        ErrorCode.PERMISSION,
      category:
        ErrorCategory.PERMISSION,
      statusCode:
        403,
      expose:
        true,
      metadata:
        permission
          ? {
              permission,
            }
          : undefined,
    },
  );
}

/**
 * Creates an authorization error for a protected resource.
 */
export function resourceAccessDeniedError(
  resource?: string,
): AuthorizationError {
  const message =
    resource
      ? `Access to ${resource} is denied.`
      : "Access to this resource is denied.";

  return new AuthorizationError(
    message,
    {
      code:
        ErrorCode.ACCESS_DENIED,
      category:
        ErrorCategory.AUTHORIZATION,
      statusCode:
        403,
      expose:
        true,
      metadata:
        resource
          ? {
              resource,
            }
          : undefined,
    },
  );
}