/**
 * Schema error base class and options.
 */

import { BaseError } from "../../base/core/baseError.core.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";

/** Options for constructing a SchemaError. */
export interface SchemaErrorOptions {
  readonly code?: ErrorCode;
  readonly issues?: readonly unknown[];
  readonly cause?: unknown;
}

/**
 * Base error for all schema validation failures.
 *
 * Carries structured issues that describe exactly what failed.
 */
export class SchemaError extends BaseError {
  public readonly issues: readonly unknown[];

  constructor(message: string, options: SchemaErrorOptions = {}) {
    super(message, {
      code: options.code ?? ErrorCode.SCHEMA_VALIDATION,
      category: ErrorCategory.VALIDATION,
      statusCode: 400,
      expose: true,
      cause: options.cause,
    });
    this.issues = options.issues ?? [];
  }
}
