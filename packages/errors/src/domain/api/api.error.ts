import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";

import type { ErrorMetadataValue } from "../../base/core/errorMetadata.core.js";

import {
  ErrorCategory,
} from "../../base/types/errorCategory.type.js";

import {
  ErrorCode,
} from "../../base/types/errorCode.type.js";

import {
  ErrorSeverity,
} from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating an API error.
 */
export interface APIErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly operationName?: string;
}

/**
 * Base error for all API failures.
 */
export class APIError extends BaseError {
  public readonly operationName?: string;

  constructor(
    message: string,
    options: APIErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.API_ERROR,
        category:
          options.category ??
          ErrorCategory.API,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ?? 500,
        expose:
          options.expose ?? false,
        isOperational:
          options.isOperational ?? true,
      },
    );

    this.operationName = options.operationName;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.operationName !== undefined
        ? { operationName: this.operationName }
        : {}),
    };
  }
}

/**
 * Creates an API error.
 */
export function createAPIError(
  message: string,
  options: APIErrorOptions = {},
): APIError {
  return new APIError(message, options);
}

/**
 * Determines whether an unknown value is an APIError.
 */
export function isAPIError(
  value: unknown,
): value is APIError {
  return value instanceof APIError;
}

/**
 * Error thrown when API input validation fails.
 */
export class APIValidationError extends APIError {
  public readonly issues: readonly ErrorMetadataValue[];

  constructor(
    message: string,
    issues: readonly ErrorMetadataValue[] = [],
    operationName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.API_VALIDATION,
        operationName,
        metadata: { issues },
        statusCode: 400,
        expose: true,
      },
    );

    this.name = "APIValidationError";
    this.issues = Object.freeze([...issues]);
  }
}

/**
 * Error thrown when API authentication fails.
 */
export class APIAuthenticationError extends APIError {
  constructor(
    message = "Authentication is required.",
    operationName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.API_AUTHENTICATION,
        operationName,
        statusCode: 401,
        expose: true,
      },
    );

    this.name = "APIAuthenticationError";
  }
}

/**
 * Error thrown when API authorization fails.
 */
export class APIAuthorizationError extends APIError {
  constructor(
    message = "You do not have permission to perform this operation.",
    operationName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.API_AUTHORIZATION,
        operationName,
        statusCode: 403,
        expose: true,
      },
    );

    this.name = "APIAuthorizationError";
  }
}

/**
 * Error thrown when an API resource is not found.
 */
export class APINotFoundError extends APIError {
  constructor(
    message: string,
    operationName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.API_NOT_FOUND,
        operationName,
        statusCode: 404,
        expose: true,
      },
    );

    this.name = "APINotFoundError";
  }
}

/**
 * Error thrown when an API conflict occurs.
 */
export class APIConflictError extends APIError {
  constructor(
    message: string,
    operationName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.API_CONFLICT,
        operationName,
        statusCode: 409,
        expose: true,
      },
    );

    this.name = "APIConflictError";
  }
}

/**
 * Error thrown when an API rate limit is exceeded.
 */
export class APIRateLimitError extends APIError {
  public readonly retryAfter?: number;

  constructor(
    message = "Rate limit exceeded.",
    retryAfter?: number,
    operationName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.API_RATE_LIMIT,
        operationName,
        metadata: { retryAfter },
        statusCode: 429,
        expose: true,
      },
    );

    this.name = "APIRateLimitError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when an API operation times out.
 */
export class APITimeoutError extends APIError {
  public readonly timeout: number;

  constructor(
    timeout: number,
    operationName?: string,
  ) {
    super(
      `Operation timed out after ${timeout}ms.`,
      {
        code: ErrorCode.API_TIMEOUT,
        operationName,
        metadata: { timeout },
        statusCode: 504,
        expose: false,
      },
    );

    this.name = "APITimeoutError";
    this.timeout = timeout;
  }
}

/**
 * Error thrown when an API service is unavailable.
 */
export class APIUnavailableError extends APIError {
  constructor(
    message = "Service is temporarily unavailable.",
    operationName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.API_UNAVAILABLE,
        operationName,
        statusCode: 503,
        expose: true,
      },
    );

    this.name = "APIUnavailableError";
  }
}

/**
 * Error thrown when an unexpected internal API error occurs.
 */
export class APIInternalError extends APIError {
  constructor(
    message = "An unexpected internal error occurred.",
    operationName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.API_INTERNAL,
        operationName,
        statusCode: 500,
        expose: false,
        isOperational: false,
      },
    );

    this.name = "APIInternalError";
  }
}

/**
 * Error thrown when an API version is invalid or unsupported.
 */
export class APIVersionError extends APIError {
  constructor(
    message: string,
    operationName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.API_VERSION,
        operationName,
        statusCode: 400,
        expose: true,
      },
    );

    this.name = "APIVersionError";
  }
}

/**
 * Error thrown when an API operation is not found.
 */
export class APIOperationNotFoundError extends APIError {
  constructor(
    operationName: string,
  ) {
    super(
      `API operation "${operationName}" is not registered.`,
      {
        code: ErrorCode.API_OPERATION_NOT_FOUND,
        operationName,
        statusCode: 404,
        expose: true,
      },
    );

    this.name = "APIOperationNotFoundError";
  }
}

/**
 * Error thrown when a duplicate API operation is registered.
 */
export class APIDuplicateOperationError extends APIError {
  constructor(
    operationName: string,
  ) {
    super(
      `API operation "${operationName}" is already registered.`,
      {
        code: ErrorCode.API_DUPLICATE_OPERATION,
        operationName,
        statusCode: 409,
        expose: true,
      },
    );

    this.name = "APIDuplicateOperationError";
  }
}

/**
 * Error thrown when an idempotency key is missing or invalid.
 */
export class APIIdempotencyError extends APIError {
  constructor(
    message = "Idempotency key is required or has already been used.",
    operationName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.API_IDEMPOTENCY,
        operationName,
        statusCode: 422,
        expose: true,
      },
    );

    this.name = "APIIdempotencyError";
  }
}
