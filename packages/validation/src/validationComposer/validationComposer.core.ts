import type {
  ValidationConstraint,
} from "../validationConstraints/validationConstraints.core.js";

import type {
  ValidationIssue,
} from "../validationResult/validationResult.type.js";

import {
  checkConstraints,
} from "../validationConstraints/validationConstraints.core.js";

import type {
  ValidationResult,
} from "../validationResult/validationResult.type.js";

import {
  failure,
  success,
} from "../validationResult/validationResult.type.js";

import type {
  ValidationSchema,
} from "../validationSchema/validationSchema.core.js";

import {
  validate,
} from "../validationSchema/validationSchema.core.js";

import {
  ConstraintValidationError,
} from "../validationErrors/validationError.base.js";

/**
 * A validation operation that receives unknown input.
 */
export type ValidationStep<T> = (
  value: T,
) => ValidationResult<T>;

/**
 * Options for composing validation operations.
 */
export interface ValidationComposerOptions {
  readonly name?: string;
  readonly stopOnFirstError?: boolean;
}

/**
 * Reusable composed validator.
 */
export interface ValidationComposer<T> {
  readonly name: string;

  validate(
    value: T,
  ): ValidationResult<T>;

  assert(
    value: T,
  ): T;
}

/**
 * Creates a reusable validator from validation steps.
 */
export function createValidationComposer<T>(
  steps: readonly ValidationStep<T>[],
  options: ValidationComposerOptions = {},
): ValidationComposer<T> {
  const name =
    options.name ??
    "ValidationComposer";

  const stopOnFirstError =
    options.stopOnFirstError ??
    false;

  return Object.freeze({
    name,

    validate(
      value: T,
    ): ValidationResult<T> {
      let current =
        value;

      const issues = [];

      for (
        const step of steps
      ) {
        const result =
          step(current);

        if (
          result.success
        ) {
          current =
            result.data;
          continue;
        }

        issues.push(
          ...result.issues,
        );

        if (
          stopOnFirstError
        ) {
          break;
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
        current,
      );
    },

    assert(
      value: T,
    ): T {
      const result =
        this.validate(
          value,
        );

      if (
        !result.success
      ) {
        throw new ConstraintValidationError(
          `${name} validation failed.`,
          result.issues,
        );
      }

      return result.data;
    },
  });
}

/**
 * Composes multiple schemas into a sequential validation pipeline.
 *
 * The output of one schema becomes the input to the next schema.
 */
export function composeSchemas<
  T,
>(
  ...schemas: readonly ValidationSchema<T>[]
): ValidationSchema<T> {
  if (
    schemas.length === 0
  ) {
    throw new TypeError(
      "At least one schema is required.",
    );
  }

  const [first, ...rest] =
    schemas;

  return rest.reduce(
    (current, schema) =>
      // Zod's pipe() has strict input/output type requirements
      // that don't align with our generic ValidationSchema type.
      // This assertion is safe because the schemas are validated at runtime.
      (current as unknown as { pipe(s: unknown): unknown }).pipe(schema) as ValidationSchema<T>,
    first!,
  );
}

/**
 * Creates a validation step from a schema.
 */
export function schemaStep<T>(
  schema: ValidationSchema<T>,
): ValidationStep<T> {
  return (
    value: T,
  ): ValidationResult<T> =>
    validate(
      schema,
      value,
    );
}

/**
 * Creates a validation step from a constraint.
 */
export function constraintStep<T>(
  constraint: ValidationConstraint<T>,
): ValidationStep<T> {
  return (
    value: T,
  ): ValidationResult<T> =>
    checkConstraints(
      [constraint],
      value,
    );
}

/**
 * Creates a validation step from multiple constraints.
 */
export function constraintsStep<T>(
  constraints: readonly ValidationConstraint<T>[],
): ValidationStep<T> {
  return (
    value: T,
  ): ValidationResult<T> =>
    checkConstraints(
      constraints,
      value,
    );
}

/**
 * Combines validators using logical AND semantics.
 *
 * Every validator must succeed.
 */
export function all<T>(
  ...validators: readonly ValidationStep<T>[]
): ValidationStep<T> {
  return (
    value: T,
  ): ValidationResult<T> => {
    const issues = [];

    for (
      const validator of validators
    ) {
      const result =
        validator(value);

      if (
        !result.success
      ) {
        issues.push(
          ...result.issues,
        );
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
  };
}

/**
 * Combines validators using logical OR semantics.
 *
 * The operation succeeds when at least one validator succeeds.
 */
export function any<T>(
  ...validators: readonly ValidationStep<T>[]
): ValidationStep<T> {
  return (
    value: T,
  ): ValidationResult<T> => {
    const issues = [];

    for (
      const validator of validators
    ) {
      const result =
        validator(value);

      if (
        result.success
      ) {
        return result;
      }

      issues.push(
        ...result.issues,
      );
    }

    return failure(
      issues.length > 0
        ? issues
        : [
            {
              path: [],
              code:
                "no_validator_succeeded",
              message:
                "No validation rule accepted the value.",
              received:
                value,
            },
          ],
    );
  };
}

/**
 * Runs validators sequentially and returns the first successful result.
 */
export function first<T>(
  ...validators: readonly ValidationStep<T>[]
): ValidationStep<T> {
  return (
    value: T,
  ): ValidationResult<T> => {
    let issues: ValidationIssue[] = [];

    for (
      const validator of validators
    ) {
      const result =
        validator(value);

      if (
        result.success
      ) {
        return result;
      }

      issues = [
        ...issues,
        ...result.issues,
      ];
    }

    return failure(
      issues.length > 0
        ? issues
        : [
            {
              path: [],
              code:
                "no_validator_succeeded",
              message:
                "No validation rule accepted the value.",
              received:
                value,
            },
          ],
    );
  };
}

/**
 * Negates a validation step.
 */
export function negate<T>(
  validator: ValidationStep<T>,
): ValidationStep<T> {
  return (
    value: T,
  ): ValidationResult<T> => {
    const result =
      validator(value);

    if (
      result.success
    ) {
      return failure([
        {
          path: [],
          code:
            "negated_validation_failed",
          message:
            "Value must not satisfy the supplied validation rule.",
          received:
            value,
        },
      ]);
    }

    return success(
      value,
    );
  };
}

/**
 * Makes a validation step optional.
 *
 * Undefined values bypass the validator.
 */
export function optional<T>(
  validator: ValidationStep<T>,
): ValidationStep<
  T | undefined
> {
  return (
    value: T | undefined,
  ): ValidationResult<
    T | undefined
  > => {
    if (
      value === undefined
    ) {
      return success(
        undefined,
      );
    }

    return validator(
      value,
    );
  };
}

/**
 * Makes a validation step nullable.
 *
 * Null values bypass the validator.
 */
export function nullable<T>(
  validator: ValidationStep<T>,
): ValidationStep<
  T | null
> {
  return (
    value: T | null,
  ): ValidationResult<
    T | null
  > => {
    if (
      value === null
    ) {
      return success(
        null,
      );
    }

    return validator(
      value,
    );
  };
}

/**
 * Makes a validation step optional and nullable.
 */
export function optionalNullable<T>(
  validator: ValidationStep<T>,
): ValidationStep<
  T | null | undefined
> {
  return (
    value:
      | T
      | null
      | undefined,
  ): ValidationResult<
    T | null | undefined
  > => {
    if (
      value === null ||
      value === undefined
    ) {
      return success(
        value,
      );
    }

    return validator(
      value,
    );
  };
}

/**
 * Adds a custom validation step to an existing pipeline.
 */
export function append<T>(
  composer: ValidationComposer<T>,
  step: ValidationStep<T>,
  options: ValidationComposerOptions = {},
): ValidationComposer<T> {
  return createValidationComposer(
    [
      composer.validate,
      step,
    ],
    {
      ...options,
      name:
        options.name ??
        composer.name,
    },
  );
}

/**
 * Creates a pipeline that validates a value and returns the original value.
 */
export function tap<T>(
  validator: ValidationStep<T>,
): ValidationStep<T> {
  return (
    value: T,
  ): ValidationResult<T> => {
    const result =
      validator(value);

    if (
      !result.success
    ) {
      return result;
    }

    return success(
      value,
    );
  };
}

/**
 * Creates a validation step that only runs when a predicate matches.
 */
export function when<T>(
  predicate: (
    value: T,
  ) => boolean,
  validator: ValidationStep<T>,
): ValidationStep<T> {
  return (
    value: T,
  ): ValidationResult<T> => {
    if (
      !predicate(value)
    ) {
      return success(
        value,
      );
    }

    return validator(
      value,
    );
  };
}

/**
 * Creates a validation step that runs only when a predicate does not match.
 */
export function unless<T>(
  predicate: (
    value: T,
  ) => boolean,
  validator: ValidationStep<T>,
): ValidationStep<T> {
  return (
    value: T,
  ): ValidationResult<T> => {
    if (
      predicate(value)
    ) {
      return success(
        value,
      );
    }

    return validator(
      value,
    );
  };
}

/**
 * Applies a mapping operation after successful validation.
 */
export function mapValidated<T, U>(
  validator: ValidationStep<T>,
  mapper: (
    value: T,
  ) => U,
): ValidationStep<T> {
  return (
    value: T,
  ): ValidationResult<T> => {
    const result =
      validator(value);

    if (
      !result.success
    ) {
      return result;
    }

    mapper(
      result.data,
    );

    return success(
      result.data,
    );
  };
}