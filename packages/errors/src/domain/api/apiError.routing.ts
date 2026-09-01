/**
 * API routing and operation error classes.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import { APIError } from "./apiError.base.js";

/** Error thrown when an API endpoint is not found. */
export class APINotFoundError extends APIError {
  constructor(endpoint: string, method = "GET") {
    super(`Endpoint "${method} ${endpoint}" was not found.`, {
      code: ErrorCode.NOT_FOUND,
      endpoint,
      method,
      statusCode: 404,
      expose: true,
    });
  }
}

/** Error thrown when an API conflict occurs. */
export class APIConflictError extends APIError {
  constructor(
    message: string,
    options: { endpoint?: string; method?: string } = {},
  ) {
    super(message, {
      code: ErrorCode.CONFLICT,
      endpoint: options.endpoint,
      method: options.method,
      statusCode: 409,
      expose: true,
    });
  }
}

/** Error thrown when an API operation is not found. */
export class APIOperationNotFoundError extends APIError {
  constructor(operation: string) {
    super(`API operation "${operation}" was not found.`, {
      code: ErrorCode.NOT_FOUND,
      endpoint: operation,
      statusCode: 404,
      expose: true,
    });
  }
}

/** Error thrown when a duplicate API operation is registered. */
export class APIDuplicateOperationError extends APIError {
  constructor(operation: string) {
    super(`API operation "${operation}" is already registered.`, {
      code: ErrorCode.CONFLICT,
      endpoint: operation,
      statusCode: 409,
      expose: true,
    });
  }
}

/** Error thrown when API versioning fails. */
export class APIVersionError extends APIError {
  constructor(
    message: string,
    options: { endpoint?: string; method?: string } = {},
  ) {
    super(message, {
      code: ErrorCode.API_VERSION,
      endpoint: options.endpoint,
      method: options.method,
      statusCode: 400,
      expose: true,
    });
  }
}
