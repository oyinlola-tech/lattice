/**
 * @oyinlola141/lattice-errors/domain/api
 *
 * API-specific error types.
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
} from "./api.error.js";

export type { APIErrorOptions } from "./api.error.js";
