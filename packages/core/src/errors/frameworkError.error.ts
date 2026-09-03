/**
 * Base error type for all Zudo framework errors.
 *
 * FrameworkError extends ApplicationError from @zudolib/errors
 * to maintain backward compatibility while providing structured
 * error information for HTTP handlers, logging, and observability.
 */

import { ApplicationError, type SerializedBaseError } from "@zudolib/errors";

/**
 * Options accepted by FrameworkError.
 */
export interface FrameworkErrorOptions {
  readonly code?: string;
  readonly details?: unknown;
  readonly status?: number;
  readonly cause?: unknown;
}

/**
 * Serializable representation of a FrameworkError.
 */
export interface FrameworkErrorJSON {
  readonly name: string;
  readonly message: string;
  readonly code: string;
  readonly status?: number;
  readonly details?: unknown;
}

/**
 * Base error class for all Zudo framework errors.
 *
 * FrameworkError extends ApplicationError from @zudolib/errors
 * so all framework errors inherit BaseError properties (code,
 * category, severity, statusCode, metadata, serialization).
 */
export class FrameworkError extends ApplicationError {
  /**
   * Optional structured details associated with the error.
   */
  public readonly details?: unknown;

  /**
   * Creates a framework error.
   */
  public constructor(message: string, options: FrameworkErrorOptions = {}) {
    super(message, {
      code: options.code as any,
      statusCode: options.status,
      cause: options.cause,
    });

    this.name = "FrameworkError";
    this.details = options.details;
  }

  /**
   * Converts the error into a structured representation.
   */
  public override toJSON(): SerializedBaseError & {
    readonly details?: unknown;
  } {
    return {
      ...super.toJSON(),
      name: this.name,
      message: this.message,
      code: String(this.code),
      category: this.category,
      severity: this.severity,
      statusCode: this.statusCode,
      expose: this.expose,
      isOperational: this.isOperational,
      metadata: this.metadata,
      ...(this.details !== undefined && {
        details: this.details,
      }),
    };
  }
}
