import { BaseError } from "../base/core/baseError.core.js";

import {
  ErrorCategory,
} from "../base/types/errorCategory.type.js";

import {
  ErrorSeverity,
} from "../base/types/errorSeverity.type.js";

/**
 * Type guard for unknown error-like values.
 */
export function isErrorLike(
  value: unknown,
): value is {
  readonly name: string;
  readonly message: string;
  readonly stack?: string;
} {
  return (
    typeof value === "object" &&
    value !== null &&
    "message" in value &&
    typeof (
      value as {
        message?: unknown;
      }
    ).message === "string"
  );
}

/**
 * Returns the message from an unknown thrown value.
 */
export function getErrorMessage(
  value: unknown,
  fallback =
    "An unexpected error occurred.",
): string {
  if (
    value instanceof Error
  ) {
    return (
      value.message ||
      fallback
    );
  }

  if (
    typeof value === "string"
  ) {
    return value;
  }

  if (
    isErrorLike(value)
  ) {
    return value.message;
  }

  return fallback;
}

/**
 * Returns the name from an unknown thrown value.
 */
export function getErrorName(
  value: unknown,
  fallback = "Error",
): string {
  if (
    value instanceof Error
  ) {
    return (
      value.name ||
      fallback
    );
  }

  if (
    isErrorLike(value) &&
    typeof value.name ===
      "string"
  ) {
    return value.name;
  }

  return fallback;
}

/**
 * Returns the stack trace from an unknown thrown value.
 */
export function getErrorStack(
  value: unknown,
): string | undefined {
  if (
    value instanceof Error
  ) {
    return value.stack;
  }

  if (
    isErrorLike(value)
  ) {
    return value.stack;
  }

  return undefined;
}

/**
 * Returns the root cause of an error chain.
 */
export function getRootCause(
  value: unknown,
): unknown {
  let current =
    value;

  const visited =
    new Set<unknown>();

  while (
    current instanceof Error &&
    "cause" in current &&
    current.cause !== undefined &&
    !visited.has(current)
  ) {
    visited.add(current);
    current =
      current.cause;
  }

  return current;
}

/**
 * Returns the deepest BaseError in an error chain.
 */
export function getRootBaseError(
  value: unknown,
): BaseError | undefined {
  let current:
    | unknown =
    value;

  let result:
    | BaseError
    | undefined;

  const visited =
    new Set<unknown>();

  while (
    current !== undefined &&
    current !== null &&
    !visited.has(current)
  ) {
    visited.add(current);

    if (
      current instanceof
      BaseError
    ) {
      result =
        current;
    }

    if (
      current instanceof Error &&
      "cause" in current
    ) {
      current =
        current.cause;
      continue;
    }

    break;
  }

  return result;
}

/**
 * Returns whether an error is operational.
 */
export function isOperationalError(
  value: unknown,
): boolean {
  return (
    value instanceof BaseError &&
    value.isOperational
  );
}

/**
 * Returns whether an error is safe to expose to clients.
 */
export function isExposableError(
  value: unknown,
): boolean {
  return (
    value instanceof BaseError &&
    value.expose
  );
}

/**
 * Returns whether an error represents a server-side failure.
 */
export function isServerError(
  value: unknown,
): boolean {
  if (
    value instanceof BaseError
  ) {
    return (
      value.statusCode >=
      500
    );
  }

  return true;
}

/**
 * Returns whether an error represents a client-side failure.
 */
export function isClientError(
  value: unknown,
): boolean {
  return (
    value instanceof BaseError &&
    value.statusCode >=
      400 &&
    value.statusCode <
      500
  );
}

/**
 * Returns whether an error belongs to a category.
 */
export function hasErrorCategory(
  value: unknown,
  category: ErrorCategory,
): boolean {
  return (
    value instanceof BaseError &&
    value.category ===
      category
  );
}

/**
 * Returns whether an error has a specific severity.
 */
export function hasErrorSeverity(
  value: unknown,
  severity: ErrorSeverity,
): boolean {
  return (
    value instanceof BaseError &&
    value.severity ===
      severity
  );
}

/**
 * Safely converts an unknown thrown value into an Error instance.
 */
export function toError(
  value: unknown,
  fallback =
    "An unexpected error occurred.",
): Error {
  if (
    value instanceof Error
  ) {
    return value;
  }

  return new Error(
    getErrorMessage(
      value,
      fallback,
    ),
  );
}

/**
 * Adds context to an Error while preserving the original error as its cause.
 */
export function withErrorContext(
  error: unknown,
  context: string,
): Error {
  const original =
    toError(error);

  return new Error(
    `${context}: ${original.message}`,
    {
      cause:
        original,
    },
  );
}

/**
 * Executes a function and converts thrown values into BaseError instances.
 */
export function tryCatch<T>(
  operation: () => T,
): {
  readonly success: true;
  readonly value: T;
} | {
  readonly success: false;
  readonly error: BaseError;
} {
  try {
    return {
      success: true,
      value:
        operation(),
    };
  } catch (error) {
    return {
      success: false,
      error:
        normalizeToBaseError(
          error,
        ),
    };
  }
}

/**
 * Async equivalent of tryCatch.
 */
export async function tryCatchAsync<T>(
  operation: () =>
    | T
    | Promise<T>,
): Promise<
  | {
      readonly success: true;
      readonly value: T;
    }
  | {
      readonly success: false;
      readonly error: BaseError;
    }
> {
  try {
    return {
      success: true,
      value:
        await operation(),
    };
  } catch (error) {
    return {
      success: false,
      error:
        normalizeToBaseError(
          error,
        ),
    };
  }
}

/**
 * Converts an unknown thrown value into a BaseError.
 */
export function normalizeToBaseError(
  value: unknown,
): BaseError {
  if (
    value instanceof BaseError
  ) {
    return value;
  }

  if (
    value instanceof Error
  ) {
    return new BaseError(
      value.message ||
        "An unexpected error occurred.",
      {
        code:
          "INTERNAL_ERROR",
        category:
          ErrorCategory.SYSTEM,
        severity:
          ErrorSeverity.ERROR,
        statusCode:
          500,
        expose:
          false,
        isOperational:
          false,
        cause:
          value,
      },
    );
  }

  return new BaseError(
    getErrorMessage(
      value,
    ),
    {
      code:
        "INTERNAL_ERROR",
      category:
        ErrorCategory.SYSTEM,
      severity:
        ErrorSeverity.ERROR,
      statusCode:
        500,
      expose:
        false,
      isOperational:
        false,
      metadata: {
        originalType:
          typeof value,
      },
    },
  );
}

/**
 * Extracts a plain object of useful error diagnostics.
 */
export function getErrorDiagnostics(
  value: unknown,
): Record<string, unknown> {
  const diagnostics: Record<
    string,
    unknown
  > = {
    name:
      getErrorName(value),
    message:
      getErrorMessage(value),
  };

  const stack =
    getErrorStack(value);

  if (
    stack !== undefined
  ) {
    diagnostics.stack =
      stack;
  }

  if (
    value instanceof BaseError
  ) {
    diagnostics.code =
      value.code;
    diagnostics.category =
      value.category;
    diagnostics.severity =
      value.severity;
    diagnostics.statusCode =
      value.statusCode;
    diagnostics.isOperational =
      value.isOperational;
    diagnostics.expose =
      value.expose;
  }

  return diagnostics;
}

