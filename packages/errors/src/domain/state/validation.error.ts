import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";

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
 * A single validation issue.
 */
export interface ValidationIssue {
  readonly field?: string;
  readonly path?: readonly (
    | string
    | number
  )[];
  readonly code?: string;
  readonly message: string;
  readonly value?: unknown;
}

/**
 * Options for creating a validation error.
 */
export interface ValidationErrorOptions
  extends Omit<
    BaseErrorOptions,
    "category"
  > {
  readonly category?: ErrorCategory;
  readonly issues?: readonly ValidationIssue[];
}

/**
 * Error raised when input fails validation.
 */
export class ValidationError
  extends BaseError {
  public readonly issues: readonly ValidationIssue[];

  constructor(
    message =
      "Validation failed.",
    options: ValidationErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.VALIDATION_FAILED,
        category:
          options.category ??
          ErrorCategory.VALIDATION,
        severity:
          options.severity ??
          ErrorSeverity.WARNING,
        statusCode:
          options.statusCode ??
          400,
        expose:
          options.expose ??
          true,
        isOperational:
          options.isOperational ??
          true,
      },
    );

    this.issues =
      Object.freeze([
        ...(options.issues ??
          []),
      ]);
  }

  /**
   * Returns whether any validation issues exist.
   */
  public hasIssues(): boolean {
    return this.issues.length > 0;
  }

  /**
   * Returns the number of validation issues.
   */
  public get issueCount(): number {
    return this.issues.length;
  }

  /**
   * Returns issues associated with a specific field.
   */
  public issuesForField(
    field: string,
  ): readonly ValidationIssue[] {
    return this.issues.filter(
      (issue) =>
        issue.field ===
        field ||
        issue.path?.[0] ===
          field,
    );
  }

  /**
   * Returns a serialized representation including validation issues.
   */
  public override toJSON() {
    return {
      ...super.toJSON(),
      issues: this.issues,
    };
  }
}

/**
 * Creates a validation error.
 */
export function createValidationError(
  message =
    "Validation failed.",
  issues: readonly ValidationIssue[] = [],
  options: Omit<
    ValidationErrorOptions,
    "issues"
  > = {},
): ValidationError {
  return new ValidationError(
    message,
    {
      ...options,
      issues,
    },
  );
}

/**
 * Determines whether an unknown value is a ValidationError.
 */
export function isValidationError(
  value: unknown,
): value is ValidationError {
  return (
    value instanceof ValidationError
  );
}

/**
 * Creates a validation issue.
 */
export function createValidationIssue(
  message: string,
  options: Omit<
    ValidationIssue,
    "message"
  > = {},
): ValidationIssue {
  return Object.freeze({
    ...options,
    message,
  });
}

/**
 * Creates a required-field validation issue.
 */
export function requiredFieldIssue(
  field: string,
  message =
    `${field} is required.`,
): ValidationIssue {
  return createValidationIssue(
    message,
    {
      field,
      code:
        ErrorCode.MISSING_FIELD,
    },
  );
}

/**
 * Creates an invalid-field validation issue.
 */
export function invalidFieldIssue(
  field: string,
  message =
    `${field} is invalid.`,
  value?: unknown,
): ValidationIssue {
  return createValidationIssue(
    message,
    {
      field,
      code:
        ErrorCode.INVALID_FIELD,
      value,
    },
  );
}