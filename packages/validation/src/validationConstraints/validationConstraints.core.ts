import type {
  ValidationIssue,
} from "../validationResult/validationResult.type.js";

import {
  failure,
  success,
  type ValidationResult,
} from "../validationResult/validationResult.type.js";

/**
 * A reusable validation constraint.
 */
export interface ValidationConstraint<T> {
  readonly name: string;

  readonly validate: (
    value: T,
  ) => boolean;

  readonly message: string;

  readonly code: string;
}

/**
 * Options for creating a validation constraint.
 */
export interface ConstraintOptions {
  readonly name?: string;
  readonly code?: string;
  readonly message?: string;
}

/**
 * Creates a reusable validation constraint.
 */
export function createConstraint<T>(
  validate: (
    value: T,
  ) => boolean,
  options: ConstraintOptions = {},
): ValidationConstraint<T> {
  const name =
    options.name ??
    "custom";

  const code =
    options.code ??
    "constraint_failed";

  const message =
    options.message ??
    "Validation constraint failed.";

  return Object.freeze({
    name,
    validate,
    message,
    code,
  });
}

/**
 * Executes a constraint against a value.
 */
export function checkConstraint<T>(
  constraint: ValidationConstraint<T>,
  value: T,
  path: readonly (
    | string
    | number
  )[] = [],
): ValidationResult<T> {
  if (
    constraint.validate(value)
  ) {
    return success(
      value,
    );
  }

  const validationIssue: ValidationIssue = {
    path: [
      ...path,
    ],
    code:
      constraint.code,
    message:
      constraint.message,
    received:
      value,
  };

  return failure([
    validationIssue,
  ]);
}

/**
 * Executes multiple constraints against a value.
 *
 * All constraints are evaluated so callers receive every issue.
 */
export function checkConstraints<T>(
  constraints: readonly ValidationConstraint<T>[],
  value: T,
  path: readonly (
    | string
    | number
  )[] = [],
): ValidationResult<T> {
  const issues: ValidationIssue[] = [];

  for (
    const constraint of constraints
  ) {
    if (
      !constraint.validate(value)
    ) {
      issues.push({
        path: [
          ...path,
        ],
        code:
          constraint.code,
        message:
          constraint.message,
        received:
          value,
      });
    }
  }

  if (
    issues.length > 0
  ) {
    return failure(
      issues,
    );
  }

  return success(
    value,
  );
}

/**
 * Combines constraints into a single constraint.
 */
export function combineConstraints<T>(
  ...constraints: readonly ValidationConstraint<T>[]
): ValidationConstraint<T> {
  return createConstraint(
    (value) =>
      constraints.every(
        (constraint) =>
          constraint.validate(
            value,
          ),
      ),
    {
      name:
        constraints
          .map(
            (constraint) =>
              constraint.name,
          )
          .join("_and_") ||
        "combined",
      code:
        "combined_constraint_failed",
      message:
        "One or more validation constraints failed.",
    },
  );
}

/**
 * Creates a negated constraint.
 */
export function not<T>(
  constraint: ValidationConstraint<T>,
  options: ConstraintOptions = {},
): ValidationConstraint<T> {
  return createConstraint(
    (value) =>
      !constraint.validate(
        value,
      ),
    {
      name:
        options.name ??
        `not_${constraint.name}`,
      code:
        options.code ??
        "negated_constraint_failed",
      message:
        options.message ??
        `Value must not satisfy ${constraint.name}.`,
    },
  );
}

/**
 * Requires a value to be defined.
 */
export const required =
  createConstraint<unknown>(
    (value) =>
      value !== undefined &&
      value !== null,
    {
      name:
        "required",
      code:
        "required",
      message:
        "Value is required.",
    },
  );

/**
 * Requires a string to be non-empty after trimming.
 */
export const nonEmptyString =
  createConstraint<string>(
    (value) =>
      typeof value ===
        "string" &&
      value.trim().length > 0,
    {
      name:
        "non_empty_string",
      code:
        "required",
      message:
        "Value must not be empty.",
    },
  );

/**
 * Requires a string to contain at least the specified number of characters.
 */
export function minLength(
  minimum: number,
): ValidationConstraint<string> {
  assertNonNegativeInteger(
    minimum,
    "minimum",
  );

  return createConstraint(
    (value) =>
      value.length >=
      minimum,
    {
      name:
        `min_length_${minimum}`,
      code:
        "min_length",
      message:
        `Value must contain at least ${minimum} characters.`,
    },
  );
}

/**
 * Requires a string to contain no more than the specified number of characters.
 */
export function maxLength(
  maximum: number,
): ValidationConstraint<string> {
  assertNonNegativeInteger(
    maximum,
    "maximum",
  );

  return createConstraint(
    (value) =>
      value.length <=
      maximum,
    {
      name:
        `max_length_${maximum}`,
      code:
        "max_length",
      message:
        `Value must contain at most ${maximum} characters.`,
    },
  );
}

/**
 * Requires a string length to fall within a range.
 */
export function lengthBetween(
  minimum: number,
  maximum: number,
): ValidationConstraint<string> {
  assertNonNegativeInteger(
    minimum,
    "minimum",
  );

  assertNonNegativeInteger(
    maximum,
    "maximum",
  );

  if (
    minimum > maximum
  ) {
    throw new RangeError(
      "minimum cannot be greater than maximum.",
    );
  }

  return createConstraint(
    (value) =>
      value.length >=
        minimum &&
      value.length <=
        maximum,
    {
      name:
        `length_between_${minimum}_${maximum}`,
      code:
        "length_between",
      message:
        `Value must contain between ${minimum} and ${maximum} characters.`,
    },
  );
}

/**
 * Requires a string to match a regular expression.
 */
export function matches(
  pattern: RegExp,
  message =
    "Value has an invalid format.",
): ValidationConstraint<string> {
  return createConstraint(
    (value) =>
      pattern.test(value),
    {
      name:
        "matches",
      code:
        "invalid_format",
      message,
    },
  );
}

/**
 * Requires a valid email-like format.
 */
export const email =
  createConstraint<string>(
    (value) =>
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/u.test(
        value,
      ),
    {
      name:
        "email",
      code:
        "invalid_email",
      message:
        "Value must be a valid email address.",
    },
  );

/**
 * Requires a UUID-like format.
 */
export const uuid =
  createConstraint<string>(
    (value) =>
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/iu.test(
        value,
      ),
    {
      name:
        "uuid",
      code:
        "invalid_uuid",
      message:
        "Value must be a valid UUID.",
    },
  );

/**
 * Requires an HTTP or HTTPS URL.
 */
export const httpUrl =
  createConstraint<string>(
    (value) => {
      try {
        const url =
          new URL(value);

        return (
          url.protocol ===
            "http:" ||
          url.protocol ===
            "https:"
        );
      } catch {
        return false;
      }
    },
    {
      name:
        "http_url",
      code:
        "invalid_url",
      message:
        "Value must be a valid HTTP or HTTPS URL.",
    },
  );

/**
 * Requires a numeric value to be greater than or equal to a minimum.
 */
export function min(
  minimum: number,
): ValidationConstraint<number> {
  if (
    !Number.isFinite(minimum)
  ) {
    throw new RangeError(
      "minimum must be a finite number.",
    );
  }

  return createConstraint(
    (value) =>
      value >=
      minimum,
    {
      name:
        `min_${minimum}`,
      code:
        "min_value",
      message:
        `Value must be greater than or equal to ${minimum}.`,
    },
  );
}

/**
 * Requires a numeric value to be less than or equal to a maximum.
 */
export function max(
  maximum: number,
): ValidationConstraint<number> {
  if (
    !Number.isFinite(maximum)
  ) {
    throw new RangeError(
      "maximum must be a finite number.",
    );
  }

  return createConstraint(
    (value) =>
      value <=
      maximum,
    {
      name:
        `max_${maximum}`,
      code:
        "max_value",
      message:
        `Value must be less than or equal to ${maximum}.`,
    },
  );
}

/**
 * Requires a numeric value to fall within a range.
 */
export function between(
  minimum: number,
  maximum: number,
): ValidationConstraint<number> {
  if (
    !Number.isFinite(
      minimum,
    ) ||
    !Number.isFinite(
      maximum,
    )
  ) {
    throw new RangeError(
      "minimum and maximum must be finite numbers.",
    );
  }

  if (
    minimum > maximum
  ) {
    throw new RangeError(
      "minimum cannot be greater than maximum.",
    );
  }

  return createConstraint(
    (value) =>
      value >=
        minimum &&
      value <=
        maximum,
    {
      name:
        `between_${minimum}_${maximum}`,
      code:
        "value_out_of_range",
      message:
        `Value must be between ${minimum} and ${maximum}.`,
    },
  );
}

/**
 * Requires a finite number.
 */
export const finiteNumber =
  createConstraint<number>(
    (value) =>
      Number.isFinite(
        value,
      ),
    {
      name:
        "finite_number",
      code:
        "invalid_number",
      message:
        "Value must be a finite number.",
    },
  );

/**
 * Requires an integer.
 */
export const integer =
  createConstraint<number>(
    (value) =>
      Number.isInteger(
        value,
      ),
    {
      name:
        "integer",
      code:
        "invalid_integer",
      message:
        "Value must be an integer.",
    },
  );

/**
 * Requires a positive number.
 */
export const positive =
  createConstraint<number>(
    (value) =>
      value > 0,
    {
      name:
        "positive",
      code:
        "invalid_positive",
      message:
        "Value must be greater than zero.",
    },
  );

/**
 * Requires a non-negative number.
 */
export const nonNegative =
  createConstraint<number>(
    (value) =>
      value >= 0,
    {
      name:
        "non_negative",
      code:
        "invalid_non_negative",
      message:
        "Value must be zero or greater.",
    },
  );

/**
 * Requires a number to be even.
 */
export const even =
  createConstraint<number>(
    (value) =>
      Number.isInteger(
        value,
      ) &&
      value % 2 === 0,
    {
      name:
        "even",
      code:
        "invalid_even",
      message:
        "Value must be an even integer.",
    },
  );

/**
 * Requires a number to be odd.
 */
export const odd =
  createConstraint<number>(
    (value) =>
      Number.isInteger(
        value,
      ) &&
      Math.abs(value % 2) === 1,
    {
      name:
        "odd",
      code:
        "invalid_odd",
      message:
        "Value must be an odd integer.",
    },
  );

/**
 * Requires a value to belong to a provided collection.
 */
export function oneOf<T>(
  values: readonly T[],
): ValidationConstraint<T> {
  return createConstraint(
    (value) =>
      values.some(
        (candidate) =>
          Object.is(
            candidate,
            value,
          ),
      ),
    {
      name:
        "one_of",
      code:
        "not_allowed",
      message:
        "Value is not an allowed value.",
    },
  );
}

/**
 * Requires a value not to belong to a provided collection.
 */
export function noneOf<T>(
  values: readonly T[],
): ValidationConstraint<T> {
  return not(
    oneOf(values),
    {
      name:
        "none_of",
      code:
        "disallowed_value",
      message:
        "Value is not allowed.",
    },
  );
}

/**
 * Requires a string to contain only ASCII characters.
 */
export const ascii =
  createConstraint<string>(
    (value) =>
      /^[\x00-\x7F]*$/u.test(
        value,
      ),
    {
      name:
        "ascii",
      code:
        "invalid_ascii",
      message:
        "Value must contain only ASCII characters.",
    },
  );

/**
 * Requires a string to contain only digits.
 */
export const digits =
  createConstraint<string>(
    (value) =>
      /^\d+$/u.test(
        value,
      ),
    {
      name:
        "digits",
      code:
        "invalid_digits",
      message:
        "Value must contain only digits.",
    },
  );

/**
 * Requires a string to contain only letters.
 */
export const letters =
  createConstraint<string>(
    (value) =>
      /^\p{L}+$/u.test(
        value,
      ),
    {
      name:
        "letters",
      code:
        "invalid_letters",
      message:
        "Value must contain only letters.",
    },
  );

/**
 * Requires a string to contain only letters, numbers, underscores,
 * or hyphens.
 */
export const slug =
  createConstraint<string>(
    (value) =>
      /^[a-z0-9]+(?:-[a-z0-9]+)*$/u.test(
        value,
      ),
    {
      name:
        "slug",
      code:
        "invalid_slug",
      message:
        "Value must be a valid slug.",
    },
  );

/**
 * Requires a string to be a valid ISO date representation.
 */
export const isoDate =
  createConstraint<string>(
    (value) => {
      const date =
        new Date(value);

      return (
        !Number.isNaN(
          date.getTime(),
        ) &&
        /^\d{4}-\d{2}-\d{2}(?:T.*)?$/u.test(
          value,
        )
      );
    },
    {
      name:
        "iso_date",
      code:
        "invalid_date",
      message:
        "Value must be a valid ISO date.",
    },
  );

/**
 * Requires a date to be in the future.
 */
export const futureDate =
  createConstraint<Date>(
    (value) =>
      value.getTime() >
      Date.now(),
    {
      name:
        "future_date",
      code:
        "invalid_future_date",
      message:
        "Date must be in the future.",
    },
  );

/**
 * Requires a date to be in the past.
 */
export const pastDate =
  createConstraint<Date>(
    (value) =>
      value.getTime() <
      Date.now(),
    {
      name:
        "past_date",
      code:
        "invalid_past_date",
      message:
        "Date must be in the past.",
    },
  );

/**
 * Requires an array to contain at least a given number of items.
 */
export function minItems<T>(
  minimum: number,
): ValidationConstraint<
  readonly T[]
> {
  assertNonNegativeInteger(
    minimum,
    "minimum",
  );

  return createConstraint(
    (value) =>
      value.length >=
      minimum,
    {
      name:
        `min_items_${minimum}`,
      code:
        "min_items",
      message:
        `Value must contain at least ${minimum} items.`,
    },
  );
}

/**
 * Requires an array to contain no more than a given number of items.
 */
export function maxItems<T>(
  maximum: number,
): ValidationConstraint<
  readonly T[]
> {
  assertNonNegativeInteger(
    maximum,
    "maximum",
  );

  return createConstraint(
    (value) =>
      value.length <=
      maximum,
    {
      name:
        `max_items_${maximum}`,
      code:
        "max_items",
      message:
        `Value must contain at most ${maximum} items.`,
    },
  );
}

/**
 * Requires an array to contain a specific number of items.
 */
export function exactItems<T>(
  length: number,
): ValidationConstraint<
  readonly T[]
> {
  assertNonNegativeInteger(
    length,
    "length",
  );

  return createConstraint(
    (value) =>
      value.length ===
      length,
    {
      name:
        `exact_items_${length}`,
      code:
        "exact_items",
      message:
        `Value must contain exactly ${length} items.`,
    },
  );
}

/**
 * Requires every array item to satisfy a constraint.
 */
export function everyItem<T>(
  constraint: ValidationConstraint<T>,
): ValidationConstraint<
  readonly T[]
> {
  return createConstraint(
    (values) =>
      values.every(
        (value) =>
          constraint.validate(
            value,
          ),
      ),
    {
      name:
        `every_${constraint.name}`,
      code:
        "item_constraint_failed",
      message:
        constraint.message,
    },
  );
}

/**
 * Requires at least one array item to satisfy a constraint.
 */
export function someItem<T>(
  constraint: ValidationConstraint<T>,
): ValidationConstraint<
  readonly T[]
> {
  return createConstraint(
    (values) =>
      values.some(
        (value) =>
          constraint.validate(
            value,
          ),
      ),
    {
      name:
        `some_${constraint.name}`,
      code:
        "some_item_constraint_failed",
      message:
        `At least one item must satisfy ${constraint.name}.`,
    },
  );
}

function assertNonNegativeInteger(
  value: number,
  name: string,
): void {
  if (
    !Number.isInteger(value) ||
    value < 0
  ) {
    throw new RangeError(
      `${name} must be a non-negative integer.`,
    );
  }
}