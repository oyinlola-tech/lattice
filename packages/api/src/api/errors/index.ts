/**
 * @zudolib/api/errors
 *
 * API-specific error classes for the Zudo framework.
 *
 * Re-exported from @zudolib/errors for convenience.
 */

export {
  APIError,
  APIValidationError,
  APIAuthenticationError,
  APIAuthorizationError,
  APINotFoundError,
  APIConflictError,
  APIRateLimitError,
  APITimeoutError,
  APIUnavailableError,
  APIInternalError,
  APIVersionError,
  APIOperationNotFoundError,
  APIDuplicateOperationError,
  APIIdempotencyError,
  createAPIError,
  isAPIError,
} from "@zudolib/errors";

export type { APIErrorOptions } from "@zudolib/errors";
