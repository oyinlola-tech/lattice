/**
 * Base SerializationError class, options, and factory functions.
 */

import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/** Options for creating a serialization error. */
export interface SerializationErrorOptions extends Omit<
  BaseErrorOptions,
  "category"
> {
  readonly category?: ErrorCategory;
  readonly format?: string;
  readonly depth?: number;
  readonly maxDepth?: number;
  readonly size?: number;
  readonly maxSize?: number;
  readonly transformerType?: string;
  readonly serializerName?: string;
}

/** Base error for all serialization subsystem failures. */
export class SerializationError extends BaseError {
  public readonly format?: string;

  constructor(message: string, options: SerializationErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.SERIALIZATION,
      category: options.category ?? ErrorCategory.OPERATION,
      severity: options.severity ?? ErrorSeverity.ERROR,
      statusCode: options.statusCode ?? 500,
      expose: options.expose ?? false,
      isOperational: options.isOperational ?? true,
    });
    this.format = options.format;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.format !== undefined ? { format: this.format } : {}),
    };
  }
}

/** Creates a serialization error. */
export function createSerializationError(
  message: string,
  options: SerializationErrorOptions = {},
): SerializationError {
  return new SerializationError(message, options);
}

/** Determines whether an unknown value is a SerializationError. */
export function isSerializationError(
  value: unknown,
): value is SerializationError {
  return value instanceof SerializationError;
}

/** Converts an unknown thrown value into a SerializationError. */
export function toSerializationError(
  error: unknown,
  options: { message?: string; code?: string } = {},
): SerializationError {
  if (error instanceof SerializationError) {
    return error;
  }
  if (error instanceof Error) {
    return new SerializationError(options.message ?? error.message, {
      code: options.code as ErrorCode | undefined,
      cause: error,
    });
  }
  return new SerializationError(options.message ?? String(error), {
    code: options.code as ErrorCode | undefined,
    cause: error,
  });
}
