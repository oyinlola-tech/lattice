/**
 * Service error classes — re-exports from focused files.
 */

export {
  ServiceError,
  createServiceError,
  isServiceError,
} from "./serviceError.base.js";
export type { ServiceErrorOptions } from "./serviceError.base.js";

export {
  serviceUnavailableError,
  serviceInitializationError,
  serviceOperationError,
} from "./serviceError.factory.js";
