import type {
  ValidationIssue,
} from "../validationResult/validationResult.type.js";

import {
  formatIssues,
  toFieldErrors,
} from "../validationResult/validationResult.type.js";

/**
 * Error codes used by the validation package.
 */
export enum ValidationErrorCode {
  INVALID_INPUT = "VALIDATION_INVALID_INPUT",
  REQUIRED = "VALIDATION_REQUIRED",
  INVALID_TYPE = "VALIDATION_INVALID_TYPE",
  INVALID_FORMAT = "VALIDATION_INVALID_FORMAT",
  INVALID_VALUE = "VALIDATION_INVALID_VALUE",
  CONSTRAINT_FAILED = "VALIDATION_CONSTRAINT_FAILED",
  SCHEMA_FAILED = "VALIDATION_SCHEMA_FAILED",
  UNKNOWN = "VALIDATION_UNKNOWN",
}

/**
 * Options used when constructing a validation error.
 */
export interface ValidationErrorOptions {
  readonly code?: ValidationErrorCode;
  readonly cause?: unknown;
  readonly context?: Readonly<
    Record<string, unknown>
  >;
}

/**
 * Base error for validation failures.
 */
export class ValidationError extends Error {
  public readonly code: ValidationErrorCode;

  public readonly issues: readonly ValidationIssue[];

  public override readonly cause?: unknown;

  public readonly context?: Readonly<
    Record<string, unknown>
  >;

  public readonly timestamp: number;

  constructor(
    message: string,
    issues: readonly ValidationIssue[] = [],
    options: ValidationErrorOptions = {},
  ) {
    super(message);

    this.name =
      "ValidationError";

    this.code =
      options.code ??
      ValidationErrorCode.UNKNOWN;

    this.issues =
      Object.freeze([
        ...issues,
      ]);

    this.cause =
      options.cause;

    this.context =
      options.context;

    this.timestamp =
      Date.now();

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }

  /**
   * Returns validation errors grouped by field.
   */
  public get fieldErrors(): Readonly<
    Record<string, string>
  > {
    return toFieldErrors(
      this.issues,
    );
  }

  /**
   * Returns a formatted representation of all issues.
   */
  public get formattedIssues(): string {
    return formatIssues(
      this.issues,
    );
  }

  /**
   * Returns a safe serializable representation.
   */
  public toJSON(): {
    readonly name: string;
    readonly code: ValidationErrorCode;
    readonly message: string;
    readonly issues: readonly ValidationIssue[];
    readonly context?: Readonly<
      Record<string, unknown>
    >;
    readonly timestamp: number;
  } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      issues: this.issues,
      ...(this.context
        ? {
            context:
              this.context,
          }
        : {}),
      timestamp:
        this.timestamp,
    };
  }
}

/**
 * Error raised when input is missing or required.
 */
export class RequiredValidationError extends ValidationError {
  constructor(
    message = "Required value is missing.",
    issues: readonly ValidationIssue[] = [],
    options: Omit<
      ValidationErrorOptions,
      "code"
    > = {},
  ) {
    super(
      message,
      issues,
      {
        ...options,
        code:
          ValidationErrorCode.REQUIRED,
      },
    );

    this.name =
      "RequiredValidationError";
  }
}

/**
 * Error raised when an input has the wrong type.
 */
export class InvalidTypeValidationError extends ValidationError {
  constructor(
    message = "Invalid value type.",
    issues: readonly ValidationIssue[] = [],
    options: Omit<
      ValidationErrorOptions,
      "code"
    > = {},
  ) {
    super(
      message,
      issues,
      {
        ...options,
        code:
          ValidationErrorCode.INVALID_TYPE,
      },
    );

    this.name =
      "InvalidTypeValidationError";
  }
}

/**
 * Error raised when an input has an invalid format.
 */
export class InvalidFormatValidationError extends ValidationError {
  constructor(
    message = "Invalid value format.",
    issues: readonly ValidationIssue[] = [],
    options: Omit<
      ValidationErrorOptions,
      "code"
    > = {},
  ) {
    super(
      message,
      issues,
      {
        ...options,
        code:
          ValidationErrorCode.INVALID_FORMAT,
      },
    );

    this.name =
      "InvalidFormatValidationError";
  }
}

/**
 * Error raised when an input contains an invalid value.
 */
export class InvalidValueValidationError extends ValidationError {
  constructor(
    message = "Invalid value.",
    issues: readonly ValidationIssue[] = [],
    options: Omit<
      ValidationErrorOptions,
      "code"
    > = {},
  ) {
    super(
      message,
      issues,
      {
        ...options,
        code:
          ValidationErrorCode.INVALID_VALUE,
      },
    );

    this.name =
      "InvalidValueValidationError";
  }
}

/**
 * Error raised when a validation constraint fails.
 */
export class ConstraintValidationError extends ValidationError {
  constructor(
    message = "Validation constraint failed.",
    issues: readonly ValidationIssue[] = [],
    options: Omit<
      ValidationErrorOptions,
      "code"
    > = {},
  ) {
    super(
      message,
      issues,
      {
        ...options,
        code:
          ValidationErrorCode.CONSTRAINT_FAILED,
      },
    );

    this.name =
      "ConstraintValidationError";
  }
}

/**
 * Error raised when schema validation fails.
 */
export class SchemaValidationError extends ValidationError {
  constructor(
    message = "Schema validation failed.",
    issues: readonly ValidationIssue[] = [],
    options: Omit<
      ValidationErrorOptions,
      "code"
    > = {},
  ) {
    super(
      message,
      issues,
      {
        ...options,
        code:
          ValidationErrorCode.SCHEMA_FAILED,
      },
    );

    this.name =
      "SchemaValidationError";
  }
}

/**
 * Converts an unknown error into a ValidationError.
 */
export function toValidationError(
  error: unknown,
  fallbackMessage = "Validation failed.",
  options: ValidationErrorOptions = {},
): ValidationError {
  if (
    error instanceof ValidationError
  ) {
    return error;
  }

  if (
    error instanceof Error
  ) {
    return new ValidationError(
      error.message ||
        fallbackMessage,
      [],
      {
        ...options,
        cause: error,
      },
    );
  }

  return new ValidationError(
    fallbackMessage,
    [],
    {
      ...options,
      cause: error,
    },
  );
}

/**
 * Returns whether an unknown value is a ValidationError.
 */
export function isValidationError(
  error: unknown,
): error is ValidationError {
  return (
    error instanceof
    ValidationError
  );
}

/**
 * Returns whether a validation error has a specific code.
 */
export function hasValidationErrorCode(
  error: unknown,
  code: ValidationErrorCode,
): boolean {
  return (
    isValidationError(error) &&
    error.code === code
  );
}

/**
 * Creates a validation error from a collection of issues.
 */
export function createValidationError(
  issues: readonly ValidationIssue[],
  options: ValidationErrorOptions = {},
): ValidationError {
  return new ValidationError(
    formatIssues(issues) ||
      "Validation failed.",
    issues,
    options,
  );
}