/**
 * HTTP client error classes — re-exports from focused files.
 */

export type { HttpClientErrorOptions } from "./httpClientError.options.js";

export {
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  HttpNotFoundError,
  MethodNotAllowedError,
  NotAcceptableError,
  RequestTimeoutError,
  HttpConflictError,
  GoneError,
  LengthRequiredError,
  PayloadTooLargeError,
  URITooLongError,
  UnsupportedMediaTypeError,
  RangeNotSatisfiableError,
  ExpectationFailedError,
} from "./httpClientError.common.js";

export {
  UnprocessableEntityError,
  LockedError,
  FailedDependencyError,
  TooEarlyError,
  UpgradeRequiredError,
  PreconditionRequiredError,
  TooManyRequestsError,
  RequestHeaderFieldsTooLargeError,
  RequestAbortedError,
} from "./httpClientError.advanced.js";

export {
  RequestBodyTimeoutError,
  UnsupportedProtocolError,
  InvalidHeaderError,
  InvalidContentTypeError,
} from "./httpClientError.specialized.js";
