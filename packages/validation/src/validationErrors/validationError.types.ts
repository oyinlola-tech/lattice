/**
 * Specific validation error subclasses.
 */

import type { ValidationIssue } from "../validationResult/validationResult.type.js";
import {
  ValidationError,
  ValidationErrorCode,
  type ValidationErrorOptions,
} from "./validationError.base.js";

/** Error raised when input is missing or required. */
export class RequiredValidationError extends ValidationError {
  constructor(
    message = "Required value is missing.",
    issues: readonly ValidationIssue[] = [],
    options: Omit<ValidationErrorOptions, "code"> = {},
  ) {
    super(message, issues, { ...options, code: ValidationErrorCode.REQUIRED });
    this.name = "RequiredValidationError";
  }
}

/** Error raised when an input has the wrong type. */
export class InvalidTypeValidationError extends ValidationError {
  constructor(
    message = "Invalid value type.",
    issues: readonly ValidationIssue[] = [],
    options: Omit<ValidationErrorOptions, "code"> = {},
  ) {
    super(message, issues, {
      ...options,
      code: ValidationErrorCode.INVALID_TYPE,
    });
    this.name = "InvalidTypeValidationError";
  }
}

/** Error raised when an input has an invalid format. */
export class InvalidFormatValidationError extends ValidationError {
  constructor(
    message = "Invalid value format.",
    issues: readonly ValidationIssue[] = [],
    options: Omit<ValidationErrorOptions, "code"> = {},
  ) {
    super(message, issues, {
      ...options,
      code: ValidationErrorCode.INVALID_FORMAT,
    });
    this.name = "InvalidFormatValidationError";
  }
}

/** Error raised when an input contains an invalid value. */
export class InvalidValueValidationError extends ValidationError {
  constructor(
    message = "Invalid value.",
    issues: readonly ValidationIssue[] = [],
    options: Omit<ValidationErrorOptions, "code"> = {},
  ) {
    super(message, issues, {
      ...options,
      code: ValidationErrorCode.INVALID_VALUE,
    });
    this.name = "InvalidValueValidationError";
  }
}

/** Error raised when a validation constraint fails. */
export class ConstraintValidationError extends ValidationError {
  constructor(
    message = "Validation constraint failed.",
    issues: readonly ValidationIssue[] = [],
    options: Omit<ValidationErrorOptions, "code"> = {},
  ) {
    super(message, issues, {
      ...options,
      code: ValidationErrorCode.CONSTRAINT_FAILED,
    });
    this.name = "ConstraintValidationError";
  }
}

/** Error raised when schema validation fails. */
export class SchemaValidationError extends ValidationError {
  constructor(
    message = "Schema validation failed.",
    issues: readonly ValidationIssue[] = [],
    options: Omit<ValidationErrorOptions, "code"> = {},
  ) {
    super(message, issues, {
      ...options,
      code: ValidationErrorCode.SCHEMA_FAILED,
    });
    this.name = "SchemaValidationError";
  }
}
