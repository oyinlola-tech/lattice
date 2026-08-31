import { ErrorCode } from "../base/types/errorCode.type.js";
import { RuntimeError } from "./runtimeError.base.js";

/**
 * Error thrown during runtime bootstrap.
 */
export class RuntimeBootstrapError extends RuntimeError {
  constructor(message?: string, cause?: unknown) {
    super(message ?? "Runtime bootstrap failed.", {
      code: ErrorCode.RUNTIME_BOOTSTRAP,
      phase: "bootstrap",
      cause,
      isOperational: false,
    });
  }
}

/**
 * Error thrown during runtime shutdown.
 */
export class RuntimeShutdownError extends RuntimeError {
  constructor(message?: string, cause?: unknown) {
    super(message ?? "Runtime shutdown failed.", {
      code: ErrorCode.RUNTIME_SHUTDOWN,
      phase: "shutdown",
      cause,
      isOperational: false,
    });
  }
}

/**
 * Error thrown for invalid runtime state transitions.
 */
export class RuntimeStateError extends RuntimeError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      code: ErrorCode.RUNTIME_STATE,
      phase: "state",
      cause,
      isOperational: false,
    });
  }
}

/**
 * Error thrown for runtime environment issues.
 */
export class RuntimeEnvironmentError extends RuntimeError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      code: ErrorCode.RUNTIME_ENVIRONMENT,
      phase: "environment",
      cause,
      isOperational: false,
    });
  }
}

/**
 * Error thrown for runtime manager issues.
 */
export class RuntimeManagerError extends RuntimeError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      code: ErrorCode.RUNTIME_MANAGER,
      phase: "manager",
      cause,
      isOperational: false,
    });
  }
}
