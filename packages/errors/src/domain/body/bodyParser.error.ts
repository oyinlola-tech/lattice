import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";

import { ErrorCode } from "../../base/types/errorCode.type.js";

import { ErrorCategory } from "../../base/types/errorCategory.type.js";

import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating a body parser error.
 */
export interface BodyParserErrorOptions extends Omit<
  BaseErrorOptions,
  "category"
> {
  readonly category?: ErrorCategory;
}

/**
 * Base error class for body parser errors.
 */
export class BodyParserError extends BaseError {
  constructor(message: string, options: BodyParserErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.HTTP_BODY_PARSER,
      category: options.category ?? ErrorCategory.INPUT,
      severity: options.severity ?? ErrorSeverity.ERROR,
      statusCode: options.statusCode ?? 400,
      expose: options.expose ?? true,
    });

    this.name = "BodyParserError";
  }
}

/**
 * Error thrown when an unsupported body type is encountered.
 */
export class UnsupportedBodyTypeError extends BodyParserError {
  /**
   * The unsupported content type.
   */
  public readonly contentType: string;

  constructor(contentType: string) {
    super(`Unsupported request content type: ${contentType}`, {
      code: ErrorCode.HTTP_UNSUPPORTED_BODY_TYPE,
      metadata: {
        contentType,
      },
    });

    this.name = "UnsupportedBodyTypeError";

    this.contentType = contentType;
  }
}

/**
 * Error thrown when the Content-Length header is invalid.
 */
export class InvalidContentLengthError extends BodyParserError {
  /**
   * The invalid Content-Length value.
   */
  public readonly value: string;

  constructor(value: string) {
    super(`Invalid Content-Length header: ${value}`, {
      code: ErrorCode.HTTP_INVALID_CONTENT_LENGTH,
      metadata: {
        value,
      },
    });

    this.name = "InvalidContentLengthError";

    this.value = value;
  }
}

/**
 * Creates a body parser error.
 */
export function createBodyParserError(
  message: string,
  options: BodyParserErrorOptions = {},
): BodyParserError {
  return new BodyParserError(message, options);
}

/**
 * Determines whether an unknown value is a BodyParserError.
 */
export function isBodyParserError(value: unknown): value is BodyParserError {
  return value instanceof BodyParserError;
}
