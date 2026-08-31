/**
 * Common status predicates.
 *
 * Re-exports redirect and error predicates from their dedicated modules.
 */

export {
  isRedirect,
  isPermanentRedirect,
  isTemporaryRedirect,
  isNotModified,
} from "./httpStatus.redirectPredicate.js";

export {
  isOk,
  isCreated,
  isAccepted,
  isNoContent,
  isPartialContent,
  isUnauthorized,
  isForbidden,
  isNotFound,
  isMethodNotAllowed,
  isConflict,
  isUnprocessableEntity,
  isTooManyRequests,
  isInternalServerError,
  isServiceUnavailable,
  isGatewayTimeout,
} from "./httpStatus.errorPredicate.js";
