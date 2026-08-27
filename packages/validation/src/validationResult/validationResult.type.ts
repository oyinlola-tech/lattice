/**
 * A single validation issue.
 */
export interface ValidationIssue {
  readonly path: readonly (
    | string
    | number
  )[];
  readonly code: string;
  readonly message: string;
  readonly expected?: unknown;
  readonly received?: unknown;
}

/**
 * Successful validation result.
 */
export interface ValidationSuccess<T> {
  readonly success: true;
  readonly data: T;
  readonly issues: readonly [];
}

/**
 * Failed validation result.
 */
export interface ValidationFailure {
  readonly success: false;
  readonly data: undefined;
  readonly issues: readonly ValidationIssue[];
}

/**
 * Result returned by validation operations.
 */
export type ValidationResult<T> =
  | ValidationSuccess<T>
  | ValidationFailure;

/**
 * Creates a successful validation result.
 */
export function success<T>(
  data: T,
): ValidationSuccess<T> {
  return Object.freeze({
    success: true as const,
    data,
    issues: [] as const,
  });
}

/**
 * Creates a failed validation result.
 */
export function failure(
  issues: readonly ValidationIssue[],
): ValidationFailure {
  if (issues.length === 0) {
    throw new TypeError(
      "A validation failure must contain at least one issue.",
    );
  }

  return Object.freeze({
    success: false as const,
    data: undefined,
    issues: Object.freeze([
      ...issues,
    ]),
  });
}

/**
 * Creates a validation issue.
 */
export function issue(
  message: string,
  options: {
    readonly path?: readonly (
      | string
      | number
    )[];
    readonly code?: string;
    readonly expected?: unknown;
    readonly received?: unknown;
  } = {},
): ValidationIssue {
  if (
    typeof message !== "string" ||
    message.length === 0
  ) {
    throw new TypeError(
      "Validation issue message must be a non-empty string.",
    );
  }

  return Object.freeze({
    path: Object.freeze([
      ...(options.path ?? []),
    ]),
    code:
      options.code ??
      "custom",
    message,
    ...(options.expected !== undefined
      ? {
          expected:
            options.expected,
        }
      : {}),
    ...(options.received !== undefined
      ? {
          received:
            options.received,
        }
      : {}),
  });
}

/**
 * Returns whether a validation result succeeded.
 */
export function isSuccess<T>(
  result: ValidationResult<T>,
): result is ValidationSuccess<T> {
  return result.success === true;
}

/**
 * Returns whether a validation result failed.
 */
export function isFailure<T>(
  result: ValidationResult<T>,
): result is ValidationFailure {
  return result.success === false;
}

/**
 * Extracts validated data from a successful result.
 *
 * Throws when the result represents a validation failure.
 */
export function unwrap<T>(
  result: ValidationResult<T>,
): T {
  if (result.success) {
    return result.data;
  }

  throw new ValidationResultError(
    result.issues,
  );
}

/**
 * Extracts validated data or returns a fallback value.
 */
export function unwrapOr<T>(
  result: ValidationResult<T>,
  fallback: T,
): T {
  return result.success
    ? result.data
    : fallback;
}

/**
 * Returns all validation issues.
 */
export function getIssues<T>(
  result: ValidationResult<T>,
): readonly ValidationIssue[] {
  return result.issues;
}

/**
 * Returns whether the result contains validation issues.
 */
export function hasIssues<T>(
  result: ValidationResult<T>,
): boolean {
  return result.issues.length > 0;
}

/**
 * Returns the first validation issue.
 */
export function firstIssue<T>(
  result: ValidationResult<T>,
): ValidationIssue | undefined {
  return result.issues[0];
}

/**
 * Converts validation issues into a simple field-to-message map.
 */
export function toFieldErrors(
  issues: readonly ValidationIssue[],
): Readonly<
  Record<string, string>
> {
  const errors: Record<
    string,
    string
  > = {};

  for (
    const currentIssue of issues
  ) {
    const path =
      currentIssue.path
        .map(String)
        .join(".");

    const key =
      path || "_root";

    if (
      errors[key] === undefined
    ) {
      errors[key] =
        currentIssue.message;
    }
  }

  return Object.freeze(
    errors,
  );
}

/**
 * Converts validation issues into a human-readable message.
 */
export function formatIssues(
  issues: readonly ValidationIssue[],
): string {
  return issues
    .map(
      (currentIssue) => {
        const path =
          currentIssue.path
            .map(String)
            .join(".");

        return path
          ? `${path}: ${currentIssue.message}`
          : currentIssue.message;
      },
    )
    .join("; ");
}

/**
 * Maps successful validation data to another value.
 */
export function map<T, U>(
  result: ValidationResult<T>,
  mapper: (data: T) => U,
): ValidationResult<U> {
  if (!result.success) {
    return result;
  }

  return success(
    mapper(result.data),
  );
}

/**
 * Combines multiple validation results.
 *
 * The combined result succeeds only when every result succeeds.
 */
export function combine<T extends readonly unknown[]>(
  results: {
    readonly [K in keyof T]: ValidationResult<T[K]>;
  },
): ValidationResult<T> {
  const issues: ValidationIssue[] = [];
  const values: unknown[] = [];

  for (
    const result of results
  ) {
    if (result.success) {
      values.push(
        result.data,
      );
    } else {
      issues.push(
        ...result.issues,
      );
    }
  }

  if (issues.length > 0) {
    return failure(
      issues,
    );
  }

  return success(
    values as unknown as T,
  );
}

/**
 * Error thrown when attempting to unwrap a failed validation result.
 */
export class ValidationResultError extends Error {
  public readonly issues: readonly ValidationIssue[];

  constructor(
    issues: readonly ValidationIssue[],
  ) {
    super(
      formatIssues(issues) ||
        "Validation failed.",
    );

    this.name =
      "ValidationResultError";

    this.issues =
      Object.freeze([
        ...issues,
      ]);

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }

  /**
   * Returns a serializable representation.
   */
  public toJSON(): {
    readonly name: string;
    readonly message: string;
    readonly issues: readonly ValidationIssue[];
  } {
    return {
      name: this.name,
      message: this.message,
      issues: this.issues,
    };
  }
}