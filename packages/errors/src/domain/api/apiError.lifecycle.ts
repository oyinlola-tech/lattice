/**
 * API lifecycle error classes — rate limit, timeout, availability.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import { APIError } from "./apiError.base.js";

/** Error thrown when an API rate limit is exceeded. */
export class APIRateLimitError extends APIError {
  public readonly retryAfter?: number;

  constructor(
    message = "API rate limit exceeded.",
    retryAfter?: number,
    options: { endpoint?: string; method?: string } = {},
  ) {
    super(message, {
      code: ErrorCode.RATE_LIMITED,
      endpoint: options.endpoint,
      method: options.method,
      metadata: { retryAfter },
      statusCode: 429,
      expose: true,
    });
    this.retryAfter = retryAfter;
  }
}

/** Error thrown when an API operation times out. */
export class APITimeoutError extends APIError {
  public readonly timeoutMs: number;

  constructor(
    timeoutMs: number,
    options: { endpoint?: string; method?: string } = {},
  ) {
    super(`API operation timed out after ${timeoutMs}ms.`, {
      code: ErrorCode.TIMEOUT,
      endpoint: options.endpoint,
      method: options.method,
      metadata: { timeoutMs },
      statusCode: 504,
      expose: false,
    });
    this.timeoutMs = timeoutMs;
  }
}

/** Error thrown when an API service is unavailable. */
export class APIUnavailableError extends APIError {
  constructor(
    message = "API service is temporarily unavailable.",
    options: { endpoint?: string; method?: string } = {},
  ) {
    super(message, {
      code: ErrorCode.SERVICE_UNAVAILABLE,
      endpoint: options.endpoint,
      method: options.method,
      statusCode: 503,
      expose: true,
    });
  }
}

/** Error thrown when an unexpected internal API error occurs. */
export class APIInternalError extends APIError {
  constructor(
    message = "An unexpected internal API error occurred.",
    options: { endpoint?: string; method?: string } = {},
  ) {
    super(message, {
      code: ErrorCode.INTERNAL_ERROR,
      endpoint: options.endpoint,
      method: options.method,
      statusCode: 500,
      expose: false,
      isOperational: false,
    });
  }
}

/** Error thrown when an API idempotency check fails. */
export class APIIdempotencyError extends APIError {
  constructor(
    message: string,
    options: { endpoint?: string; method?: string } = {},
  ) {
    super(message, {
      code: ErrorCode.API_IDEMPOTENCY,
      endpoint: options.endpoint,
      method: options.method,
      statusCode: 409,
      expose: true,
    });
  }
}
