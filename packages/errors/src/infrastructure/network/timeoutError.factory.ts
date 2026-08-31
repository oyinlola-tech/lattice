/**
 * Timeout error factory functions for specific operations.
 */

import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { TimeoutError, TimeoutOperation } from "./timeoutError.base.js";

/** Creates a request timeout error. */
export function requestTimeoutError(timeoutMs?: number, target?: string): TimeoutError {
  return new TimeoutError(
    target ? `The request to ${target} timed out.` : "The request timed out.",
    { code: ErrorCode.TIMEOUT, operation: TimeoutOperation.REQUEST, timeoutMs, target },
  );
}

/** Creates a database timeout error. */
export function databaseTimeoutError(timeoutMs?: number, target?: string): TimeoutError {
  return new TimeoutError(
    target ? `The database operation on ${target} timed out.` : "The database operation timed out.",
    { code: ErrorCode.DATABASE_TIMEOUT, category: ErrorCategory.DATABASE, operation: TimeoutOperation.DATABASE, timeoutMs, target },
  );
}

/** Creates an external-service timeout error. */
export function serviceTimeoutError(target?: string, timeoutMs?: number): TimeoutError {
  return new TimeoutError(
    target ? `The request to ${target} timed out.` : "The external service request timed out.",
    { code: ErrorCode.EXTERNAL_SERVICE_TIMEOUT, category: ErrorCategory.EXTERNAL_SERVICE, operation: TimeoutOperation.EXTERNAL_SERVICE, timeoutMs, target },
  );
}

/** Creates a lock acquisition timeout error. */
export function lockTimeoutError(target?: string, timeoutMs?: number): TimeoutError {
  return new TimeoutError(
    target ? `Timed out while waiting for lock "${target}".` : "Timed out while waiting for a lock.",
    { code: ErrorCode.LOCK_TIMEOUT, category: ErrorCategory.CONFLICT, operation: TimeoutOperation.LOCK, timeoutMs, target, statusCode: 409 },
  );
}
