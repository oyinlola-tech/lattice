/**
 * @zudoliblib/api/errors
 *
 * API-specific error classes for the Zudolib framework.
 *
 * Re-exported from @zudoliblib/errors for convenience.
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
} from "@zudoliblib/errors";

export type { APIErrorOptions } from "@zudoliblib/errors";
