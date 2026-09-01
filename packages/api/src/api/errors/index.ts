/**
 * @oyinlola141/lattice-api/errors
 *
 * API-specific error classes for the Lattice framework.
 *
 * Re-exported from @oyinlola141/lattice-errors for convenience.
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
} from "@oyinlola141/lattice-errors";

export type { APIErrorOptions } from "@oyinlola141/lattice-errors";
