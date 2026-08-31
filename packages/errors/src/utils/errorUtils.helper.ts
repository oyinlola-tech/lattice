/**
 * Error utilities — re-exports from focused files.
 */

export {
  isErrorLike,
  isOperationalError,
  isExposableError,
  isServerError,
  isClientError,
  hasErrorCategory,
  hasErrorSeverity,
} from "./errorUtils.typeCheck.js";

export {
  getErrorMessage,
  getErrorName,
  getErrorStack,
  getRootCause,
  getRootBaseError,
  getErrorDiagnostics,
} from "./errorUtils.extraction.js";

export {
  toError,
  withErrorContext,
  tryCatch,
  tryCatchAsync,
  normalizeToBaseError,
} from "./errorUtils.transform.js";
