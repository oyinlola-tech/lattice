import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";

import {
  ErrorCode,
} from "../../base/types/errorCode.type.js";

import {
  ErrorCategory,
} from "../../base/types/errorCategory.type.js";

import {
  ErrorSeverity,
} from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating an HTTP body error.
 */
export interface HttpBodyErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
}

/**
 * Base error class for HTTP body reading errors.
 */
export class HttpBodyError
  extends BaseError {
  constructor(
    message: string,
    options: HttpBodyErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.HTTP_BODY,
        category:
          options.category ??
          ErrorCategory.INPUT,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ?? 400,
        expose:
          options.expose ?? true,
      },
    );

    this.name =
      "HttpBodyError";
  }
}

/**
 * Error thrown when the request body exceeds the configured size limit.
 */
export class HttpBodyLimitError
  extends HttpBodyError {
  /**
   * The configured size limit in bytes.
   */
  public readonly limit: number;

  /**
   * The actual size of the request body in bytes.
   */
  public readonly received: number;

  constructor(
    limit: number,
    received: number,
  ) {
    super(
      "Request body exceeds the configured size limit.",
      {
        code:
          ErrorCode.HTTP_BODY_LIMIT,
        metadata: {
          limit,
          received,
        },
      },
    );

    this.name =
      "HttpBodyLimitError";

    this.limit =
      limit;

    this.received =
      received;
  }
}

/**
 * Error thrown when a request body read is aborted.
 */
export class HttpBodyAbortedError
  extends HttpBodyError {
  constructor() {
    super(
      "Request body was aborted before it could be completely read.",
      {
        code:
          ErrorCode.HTTP_BODY_ABORTED,
        statusCode: 408,
      },
    );

    this.name =
      "HttpBodyAbortedError";
  }
}

/**
 * Error thrown when request body parsing fails.
 */
export class HttpBodyParseError
  extends HttpBodyError {
  constructor(
    message: string,
    cause?: unknown,
  ) {
    super(
      message,
      {
        code:
          ErrorCode.HTTP_BODY_PARSE,
        cause,
      },
    );

    this.name =
      "HttpBodyParseError";
  }
}

/**
 * Creates an HTTP body error.
 */
export function createHttpBodyError(
  message: string,
  options: HttpBodyErrorOptions = {},
): HttpBodyError {
  return new HttpBodyError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is an HttpBodyError.
 */
export function isHttpBodyError(
  value: unknown,
): value is HttpBodyError {
  return value instanceof HttpBodyError;
}
