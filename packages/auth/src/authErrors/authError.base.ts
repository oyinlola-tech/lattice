/**
 * Authentication and authorization error classes.
 *
 * @module authErrors
 */

import {
  BaseError,
  ErrorCode,
  ErrorCategory,
  ErrorSeverity,
  type ErrorMetadata,
} from "@zudojs/errors";

/**
 * Base error for all auth-related failures.
 */
export class AuthError extends BaseError {
  constructor(
    message: string,
    options?: {
      readonly code?: ErrorCode;
      readonly metadata?: ErrorMetadata;
      readonly cause?: unknown;
    },
  ) {
    super(message, {
      code: options?.code ?? ErrorCode.AUTHENTICATION,
      category: ErrorCategory.AUTHENTICATION,
      severity: ErrorSeverity.ERROR,
      metadata: options?.metadata,
      cause: options?.cause,
    });
  }
}

/**
 * Invalid credentials (wrong password, unknown user).
 */
export class InvalidCredentialsError extends AuthError {
  constructor(message = "Invalid credentials") {
    super(message, { code: ErrorCode.INVALID_CREDENTIALS });
  }
}

/**
 * Token has expired.
 */
export class TokenExpiredError extends AuthError {
  constructor(message = "Token has expired") {
    super(message, { code: ErrorCode.TOKEN_EXPIRED });
  }
}

/**
 * Token is invalid or malformed.
 */
export class TokenInvalidError extends AuthError {
  constructor(message = "Token is invalid") {
    super(message, { code: ErrorCode.TOKEN_INVALID });
  }
}

/**
 * Token has been revoked.
 */
export class TokenRevokedError extends AuthError {
  constructor(message = "Token has been revoked") {
    super(message, { code: ErrorCode.FORBIDDEN });
  }
}

/**
 * User account is locked (too many failed attempts).
 */
export class AccountLockedError extends AuthError {
  constructor(
    message = "Account is locked due to too many failed attempts",
    options?: { readonly retryAfterSeconds?: number },
  ) {
    super(message, {
      code: ErrorCode.FORBIDDEN,
      metadata: {
        retryAfterSeconds: options?.retryAfterSeconds ?? 900,
      } as ErrorMetadata,
    });
  }
}

/**
 * User account is deactivated.
 */
export class AccountDeactivatedError extends AuthError {
  constructor(message = "User account is deactivated") {
    super(message, { code: ErrorCode.FORBIDDEN });
  }
}

/**
 * Access denied (insufficient permissions).
 */
export class AccessDeniedError extends AuthError {
  constructor(
    message = "Access denied",
    options?: { readonly requiredPermission?: string },
  ) {
    super(message, {
      code: ErrorCode.ACCESS_DENIED,
      metadata: {
        requiredPermission: options?.requiredPermission,
      } as ErrorMetadata,
    });
  }
}

/**
 * Session has expired or is invalid.
 */
export class SessionExpiredError extends AuthError {
  constructor(message = "Session has expired") {
    super(message, { code: ErrorCode.SESSION_EXPIRED });
  }
}

/**
 * Rate limit exceeded for auth endpoint.
 */
export class AuthRateLimitError extends AuthError {
  constructor(
    message = "Too many authentication attempts",
    options?: { readonly retryAfterSeconds?: number },
  ) {
    super(message, {
      code: ErrorCode.RATE_LIMITED,
      metadata: {
        retryAfterSeconds: options?.retryAfterSeconds ?? 60,
      } as ErrorMetadata,
    });
  }
}
