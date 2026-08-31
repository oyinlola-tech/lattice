/**
 * External service error classes — re-exports from focused files.
 */

export {
  ExternalServiceError,
  createExternalServiceError,
  isExternalServiceError,
} from "./externalServiceError.base.js";
export type { ExternalServiceErrorOptions } from "./externalServiceError.base.js";

export {
  externalServiceTimeoutError,
  externalServiceUnavailable,
} from "./externalServiceError.factory.js";
