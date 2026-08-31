/**
 * Authentication and authorization error types.
 *
 * @module authErrors
 */

export {
  AuthError,
  InvalidCredentialsError,
  TokenExpiredError,
  TokenInvalidError,
  TokenRevokedError,
  AccountLockedError,
  AccountDeactivatedError,
  AccessDeniedError,
  SessionExpiredError,
  AuthRateLimitError,
} from "./authError.base.js";
