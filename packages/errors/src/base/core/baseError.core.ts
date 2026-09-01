import { ErrorCategory } from "../types/errorCategory.type.js";
import { ErrorCode } from "../types/errorCode.type.js";
import { ErrorSeverity } from "../types/errorSeverity.type.js";
import type { ErrorMetadata } from "./errorMetadata.type.js";
import {
  createErrorMetadata,
  serializeErrorMetadata,
} from "./errorMetadata.core.js";
import type {
  BaseErrorOptions,
  SerializedBaseError,
} from "../types/baseError.type.js";

/**
 * Base error class shared by all Lattice application errors.
 *
 * Provides a consistent structure for error handling, logging,
 * HTTP responses, monitoring, and serialization.
 */
export class BaseError extends Error {
  public readonly code: ErrorCode | string;
  public readonly category: ErrorCategory;
  public readonly severity: ErrorSeverity;
  public readonly statusCode: number;
  public readonly expose: boolean;
  public readonly isOperational: boolean;
  public readonly metadata: Readonly<ErrorMetadata>;
  public override readonly cause: unknown;

  constructor(message: string, options: BaseErrorOptions = {}) {
    super(
      message,
      options.cause !== undefined ? { cause: options.cause } : undefined,
    );

    this.name = new.target.name;
    this.code = options.code ?? ErrorCode.UNKNOWN;
    this.category = options.category ?? ErrorCategory.UNKNOWN;
    this.severity = options.severity ?? ErrorSeverity.ERROR;
    this.statusCode = normalizeStatusCode(options.statusCode);
    this.expose = options.expose ?? this.statusCode < 500;
    this.isOperational = options.isOperational ?? true;
    this.metadata = createErrorMetadata(options.metadata);
    this.cause = options.cause;

    Object.setPrototypeOf(this, new.target.prototype);
  }

  /** Returns whether this error is safe to expose to clients. */
  public isPublic(): boolean {
    return this.expose;
  }

  /** Returns whether this error represents an operational failure. */
  public isOperationalError(): boolean {
    return this.isOperational;
  }

  /** Returns a metadata value by key. */
  public getMetadata(key: string) {
    return this.metadata[key];
  }

  /** Creates a new error with additional metadata. */
  public withMetadata(metadata: ErrorMetadata): this {
    const ErrorConstructor = this.constructor as new (
      message: string,
      options?: BaseErrorOptions,
    ) => this;

    return new ErrorConstructor(this.message, {
      code: this.code,
      category: this.category,
      severity: this.severity,
      statusCode: this.statusCode,
      expose: this.expose,
      isOperational: this.isOperational,
      metadata: { ...this.metadata, ...metadata },
      cause: this.cause,
    });
  }

  /**
   * Converts the error into a serializable representation.
   * Stack traces included for trusted internal logging.
   */
  public toJSON(): SerializedBaseError {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      statusCode: this.statusCode,
      expose: this.expose,
      isOperational: this.isOperational,
      metadata: serializeErrorMetadata(this.metadata),
      ...(this.stack ? { stack: this.stack } : {}),
      ...(this.cause !== undefined
        ? { cause: serializeErrorCause(this.cause) }
        : {}),
    };
  }

  /** Returns the error as a plain object for internal logging. */
  public toLogObject(): SerializedBaseError {
    return this.toJSON();
  }

  /** Returns a concise error description. */
  public override toString(): string {
    return `${this.name} [${this.code}]: ${this.message}`;
  }
}

/**
 * Normalizes HTTP status codes to valid range.
 */
function normalizeStatusCode(statusCode: number | undefined): number {
  if (statusCode === undefined) return 500;
  if (!Number.isInteger(statusCode) || statusCode < 100 || statusCode > 599) {
    throw new RangeError(
      "Error statusCode must be an integer between 100 and 599.",
    );
  }
  return statusCode;
}

/**
 * Serializes nested Error causes while avoiding recursive failures.
 */
function serializeErrorCause(cause: unknown): SerializedBaseError | unknown {
  if (cause instanceof BaseError) return cause.toJSON();
  if (cause instanceof Error) {
    return {
      name: cause.name,
      message: cause.message,
      ...(cause.stack ? { stack: cause.stack } : {}),
    };
  }
  return cause;
}
