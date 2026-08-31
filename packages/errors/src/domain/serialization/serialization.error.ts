import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating a serialization error.
 */
export interface SerializationErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly format?: string;
  readonly depth?: number;
  readonly maxDepth?: number;
  readonly size?: number;
  readonly maxSize?: number;
  readonly transformerType?: string;
  readonly serializerName?: string;
}

/**
 * Base error for all serialization subsystem failures.
 */
export class SerializationError extends BaseError {
  public readonly format?: string;

  constructor(
    message: string,
    options: SerializationErrorOptions = {},
  ) {
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
      ...(this.format !== undefined
        ? { format: this.format }
        : {}),
    };
  }
}

/**
 * Creates a serialization error.
 */
export function createSerializationError(
  message: string,
  options: SerializationErrorOptions = {},
): SerializationError {
  return new SerializationError(message, options);
}

/**
 * Determines whether an unknown value is a SerializationError.
 */
export function isSerializationError(
  value: unknown,
): value is SerializationError {
  return value instanceof SerializationError;
}

/**
 * Converts an unknown thrown value into a SerializationError.
 */
export function toSerializationError(
  error: unknown,
  options: { message?: string; code?: string } = {},
): SerializationError {
  if (error instanceof SerializationError) return error;

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

/**
 * Error thrown when serialization fails.
 */
export class SerializeError extends SerializationError {
  constructor(
    message: string,
    options: { format?: string; cause?: unknown } = {},
  ) {
    super(message, {
      code: ErrorCode.SERIALIZATION_FAILED,
      format: options.format,
      cause: options.cause,
    });
  }
}

/**
 * Error thrown when deserialization fails.
 */
export class DeserializeError extends SerializationError {
  constructor(
    message: string,
    options: { format?: string; cause?: unknown } = {},
  ) {
    super(message, {
      code: ErrorCode.DESERIALIZATION_FAILED,
      format: options.format,
      cause: options.cause,
    });
  }
}

/**
 * Error thrown when a serialization format is not supported.
 */
export class UnsupportedSerializationFormatError extends SerializationError {
  constructor(format: string) {
    super(`Unsupported serialization format: "${format}"`, {
      code: ErrorCode.UNSUPPORTED_FORMAT,
      format,
      statusCode: 400,
      expose: true,
    });
  }
}

/**
 * Error thrown when a named serializer is not found in the registry.
 */
export class SerializerNotFoundError extends SerializationError {
  public readonly serializerName: string;

  constructor(name: string) {
    super(`No serializer registered with name: "${name}"`, {
      code: ErrorCode.SERIALIZER_NOT_FOUND,
      serializerName: name,
      statusCode: 404,
      expose: true,
    });

    this.serializerName = name;
  }
}

/**
 * Error thrown when a circular reference is detected during serialization.
 */
export class CircularReferenceError extends SerializationError {
  public readonly circularPath: string;

  constructor(path: string = "root") {
    super(`Circular reference detected at "${path}"`, {
      code: ErrorCode.CIRCULAR_REFERENCE,
      statusCode: 400,
      expose: false,
    });

    this.circularPath = path;
  }
}

/**
 * Error thrown when maximum serialization depth is exceeded.
 */
export class SerializationDepthError extends SerializationError {
  public readonly depth: number;
  public readonly maxDepthValue: number;

  constructor(depth: number, maxDepth: number) {
    super(
      `Maximum serialization depth exceeded: ${depth} > ${maxDepth}`,
      {
        code: ErrorCode.MAX_DEPTH_EXCEEDED,
        depth,
        maxDepth,
        statusCode: 400,
        expose: false,
      },
    );

    this.depth = depth;
    this.maxDepthValue = maxDepth;
  }
}

/**
 * Error thrown when a serialized payload exceeds the size limit.
 */
export class SerializationPayloadTooLargeError extends SerializationError {
  public readonly payloadSize: number;
  public readonly maxSizeValue: number;

  constructor(size: number, maxSize: number) {
    super(
      `Serialized payload too large: ${size} bytes (max: ${maxSize})`,
      {
        code: ErrorCode.PAYLOAD_TOO_LARGE,
        size,
        maxSize,
        statusCode: 413,
        expose: false,
      },
    );

    this.payloadSize = size;
    this.maxSizeValue = maxSize;
  }
}

/**
 * Error thrown when serialized data is invalid or malformed.
 */
export class InvalidSerializedDataError extends SerializationError {
  constructor(
    message: string,
    options: { format?: string; cause?: unknown } = {},
  ) {
    super(message, {
      code: ErrorCode.INVALID_SERIALIZED_DATA,
      format: options.format,
      cause: options.cause,
      statusCode: 400,
      expose: true,
    });
  }
}

/**
 * Error thrown when a type transformer fails.
 */
export class TransformerError extends SerializationError {
  public readonly transformerType: string;

  constructor(
    type: string,
    message: string,
    options: { cause?: unknown } = {},
  ) {
    super(`Transformer error (${type}): ${message}`, {
      code: ErrorCode.TRANSFORMER_ERROR,
      transformerType: type,
      cause: options.cause,
    });

    this.transformerType = type;
  }
}

/**
 * Error thrown when a type transformer is not found.
 */
export class TransformerNotFoundError extends SerializationError {
  public readonly transformerType: string;

  constructor(type: string) {
    super(`No transformer registered for type: "${type}"`, {
      code: ErrorCode.TRANSFORMER_NOT_FOUND,
      transformerType: type,
      statusCode: 404,
      expose: true,
    });

    this.transformerType = type;
  }
}
