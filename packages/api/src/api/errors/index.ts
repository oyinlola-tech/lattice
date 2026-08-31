/**
 * @lattice/api/errors
 *
 * API-specific error classes for the Lattice framework.
 *
 * Re-exported from @lattice/errors for convenience.
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
} from "@lattice/errors";

export type { APIErrorOptions } from "@lattice/errors";
