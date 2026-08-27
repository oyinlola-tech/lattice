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
 * Options for creating an authentication error.
 */
export interface AuthenticationErrorOptions
  extends Omit<
    BaseErrorOptions,
    "category"
  > {
  readonly category?: ErrorCategory;
}

/**
 * Error raised when authentication fails.
 */
export class AuthenticationError
  extends BaseError {
  constructor(
    message =
      "Authentication failed.",
    options: AuthenticationErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.AUTHENTICATION_FAILED,
        category:
          options.category ??
          ErrorCategory.AUTHENTICATION,
        severity:
          options.severity ??
          ErrorSeverity.WARNING,
        statusCode:
          options.statusCode ??
          401,
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
 * Creates an authentication error.
 */
export function createAuthenticationError(
  message =
    "Authentication failed.",
  options: AuthenticationErrorOptions = {},
): AuthenticationError {
  return new AuthenticationError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is an AuthenticationError.
 */
export function isAuthenticationError(
  value: unknown,
): value is AuthenticationError {
  return (
    value instanceof AuthenticationError
  );
}

/**
 * Creates an authentication error for invalid credentials.
 *
 * The default message intentionally does not reveal whether a username,
 * email address, or password was incorrect.
 */
export function invalidCredentialsError(
  message =
    "Invalid credentials.",
): AuthenticationError {
  return new AuthenticationError(
    message,
    {
      code:
        ErrorCode.INVALID_CREDENTIALS,
      category:
        ErrorCategory.AUTHENTICATION,
      statusCode:
        401,
      expose:
        true,
    },
  );
}

/**
 * Creates an authentication error for an expired session.
 */
export function sessionExpiredError(
  message =
    "Your session has expired.",
): AuthenticationError {
  return new AuthenticationError(
    message,
    {
      code:
        ErrorCode.SESSION_EXPIRED,
      category:
        ErrorCategory.AUTHENTICATION,
      statusCode:
        401,
      expose:
        true,
    },
  );
}

/**
 * Creates an authentication error for an invalid token.
 */
export function invalidTokenError(
  message =
    "The authentication token is invalid.",
): AuthenticationError {
  return new AuthenticationError(
    message,
    {
      code:
        ErrorCode.TOKEN_INVALID,
      category:
        ErrorCategory.AUTHENTICATION,
      statusCode:
        401,
      expose:
        true,
    },
  );
}

/**
 * Creates an authentication error for an expired token.
 */
export function expiredTokenError(
  message =
    "The authentication token has expired.",
): AuthenticationError {
  return new AuthenticationError(
    message,
    {
      code:
        ErrorCode.TOKEN_EXPIRED,
      category:
        ErrorCategory.AUTHENTICATION,
      statusCode:
        401,
      expose:
        true,
    },
  );
}