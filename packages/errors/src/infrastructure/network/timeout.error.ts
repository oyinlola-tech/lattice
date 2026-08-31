/**
 * Timeout error classes — re-exports from focused files.
 */

export {
  TimeoutError,
  createTimeoutError,
  isTimeoutError,
  TimeoutOperation,
} from "./timeoutError.base.js";
export type { TimeoutErrorOptions } from "./timeoutError.base.js";

export {
  requestTimeoutError,
  databaseTimeoutError,
  serviceTimeoutError,
  lockTimeoutError,
} from "./timeoutError.factory.js";
