/**
 * System error factory functions.
 */

import { ErrorCode } from "../base/types/errorCode.type.js";
import { ErrorCategory } from "../base/types/errorCategory.type.js";
import { ErrorSeverity } from "../base/types/errorSeverity.type.js";
import { SystemError, SystemOperation } from "./systemError.base.js";

/** Creates a system initialization error. */
export function systemInitializationError(message: string, cause?: unknown): SystemError {
  return new SystemError(message, {
    code: ErrorCode.SYSTEM_INITIALIZATION, operation: SystemOperation.INITIALIZATION, cause,
  });
}

/** Creates a system startup error. */
export function systemStartupError(message: string, cause?: unknown): SystemError {
  return new SystemError(message, {
    code: ErrorCode.SYSTEM_STARTUP, operation: SystemOperation.STARTUP, cause,
  });
}

/** Creates a system shutdown error. */
export function systemShutdownError(message: string, cause?: unknown): SystemError {
  return new SystemError(message, {
    code: ErrorCode.SYSTEM_SHUTDOWN, operation: SystemOperation.SHUTDOWN, cause,
  });
}

/** Creates an internal system error. */
export function internalSystemError(message: string, cause?: unknown): SystemError {
  return new SystemError(message, {
    code: ErrorCode.INTERNAL_ERROR, category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.ERROR, cause, isOperational: false,
  });
}
