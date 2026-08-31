/**
 * API error classes — re-exports from focused files.
 */

export {
  APIError,
  createAPIError,
  isAPIError,
  APIValidationError,
  APIAuthenticationError,
  APIAuthorizationError,
} from "./apiError.base.js";
export type { APIErrorOptions } from "./apiError.base.js";

export {
  APINotFoundError,
  APIConflictError,
  APIOperationNotFoundError,
  APIDuplicateOperationError,
  APIVersionError,
} from "./apiError.routing.js";

export {
  APIRateLimitError,
  APITimeoutError,
  APIUnavailableError,
  APIInternalError,
  APIIdempotencyError,
} from "./apiError.lifecycle.js";
