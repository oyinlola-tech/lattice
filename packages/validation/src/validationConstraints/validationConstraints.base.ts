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
  readonly validate: (value: T) => boolean;
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
  validate: (value: T) => boolean,
  options: ConstraintOptions = {},
): ValidationConstraint<T> {
  const name = options.name ?? "custom";
  const code = options.code ?? "constraint_failed";
  const message = options.message ?? "Validation constraint failed.";

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
  path: readonly (string | number)[] = [],
): ValidationResult<T> {
  if (constraint.validate(value)) {
    return success(value);
  }

  const validationIssue: ValidationIssue = {
    path: [...path],
    code: constraint.code,
    message: constraint.message,
    received: value,
  };

  return failure([validationIssue]);
}

/**
 * Executes multiple constraints against a value.
 */
export function checkConstraints<T>(
  constraints: readonly ValidationConstraint<T>[],
  value: T,
  path: readonly (string | number)[] = [],
): ValidationResult<T> {
  const issues: ValidationIssue[] = [];

  for (const constraint of constraints) {
    if (!constraint.validate(value)) {
      issues.push({
        path: [...path],
        code: constraint.code,
        message: constraint.message,
        received: value,
      });
    }
  }

  if (issues.length > 0) {
    return failure(issues);
  }

  return success(value);
}

/**
 * Combines constraints into a single constraint.
 */
export function combineConstraints<T>(
  ...constraints: readonly ValidationConstraint<T>[]
): ValidationConstraint<T> {
  return createConstraint(
    (value) =>
      constraints.every((constraint) => constraint.validate(value)),
    {
      name: constraints.map((constraint) => constraint.name).join("_and_") || "combined",
      code: "combined_constraint_failed",
      message: "One or more validation constraints failed.",
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
    (value) => !constraint.validate(value),
    {
      name: options.name ?? `not_${constraint.name}`,
      code: options.code ?? "negated_constraint_failed",
      message: options.message ?? `Value must not satisfy ${constraint.name}.`,
    },
  );
}

/**
 * Requires a value to be defined.
 */
export const required = createConstraint<unknown>(
  (value) => value !== undefined && value !== null,
  {
    name: "required",
    code: "required",
    message: "Value is required.",
  },
);

/**
 * Asserts that a value is a non-negative integer.
 */
export function assertNonNegativeInteger(
  value: number,
  name: string,
): void {
  if (!Number.isInteger(value) || value < 0) {
    throw new RangeError(`${name} must be a non-negative integer.`);
  }
}
