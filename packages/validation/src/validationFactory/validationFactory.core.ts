import type {
  ValidationConstraint,
} from "../validationConstraints/validationConstraints.core.js";

import {
  checkConstraints,
} from "../validationConstraints/validationConstraints.core.js";

import type {
  ValidationResult,
} from "../validationResult/validationResult.type.js";

import type {
  ValidationSchema,
} from "../validationSchema/validationSchema.core.js";

import {
  validate,
  validateAsync,
} from "../validationSchema/validationSchema.core.js";

import {
  createValidationParser,
  createAsyncValidationParser,
  type ValidationParser,
  type AsyncValidationParser,
} from "../validationParser/validationParser.core.js";

import {
  createValidationTransformer,
  createAsyncValidationTransformer,
  type ValidationTransformer,
  type AsyncValidationTransformer,
  type ValidationTransform,
  type AsyncValidationTransform,
} from "../validationTransformer/validationTransformer.core.js";

import {
  createNormalizer,
  createAsyncNormalizer,
  type ValidationNormalizer,
  type AsyncValidationNormalizer,
  type Normalizer,
  type AsyncNormalizer,
} from "../validationNormalizer/validationNormalizer.core.js";

import {
  createValidationComposer,
  type ValidationComposer,
  type ValidationStep,
  type ValidationComposerOptions,
} from "../validationComposer/validationComposer.core.js";

import {
  ValidationRegistry,
} from "../validationRegistry/validationRegistry.core.js";

/**
 * Factory options shared by validation components.
 */
export interface ValidationFactoryOptions {
  readonly registry?: ValidationRegistry;
}

/**
 * Central factory for creating validation components.
 */
export class ValidationFactory {
  public readonly registry: ValidationRegistry;

  constructor(
    options: ValidationFactoryOptions = {},
  ) {
    this.registry =
      options.registry ??
      new ValidationRegistry();
  }

  /**
   * Creates a parser from a schema.
   */
  public parser<T>(
    schema: ValidationSchema<T>,
  ): ValidationParser<T> {
    return createValidationParser(
      schema,
    );
  }

  /**
   * Creates an asynchronous parser from a schema.
   */
  public asyncParser<T>(
    schema: ValidationSchema<T>,
  ): AsyncValidationParser<T> {
    return createAsyncValidationParser(
      schema,
    );
  }

  /**
   * Creates a transformer.
   */
  public transformer<T, U>(
    transform: ValidationTransform<T, U>,
  ): ValidationTransformer<T, U> {
    return createValidationTransformer(
      transform,
    );
  }

  /**
   * Creates an asynchronous transformer.
   */
  public asyncTransformer<T, U>(
    transform: AsyncValidationTransform<T, U>,
  ): AsyncValidationTransformer<T, U> {
    return createAsyncValidationTransformer(
      transform,
    );
  }

  /**
   * Creates a normalizer.
   */
  public normalizer<T>(
    normalizer: Normalizer<T>,
  ): ValidationNormalizer<T> {
    return createNormalizer(
      normalizer,
    );
  }

  /**
   * Creates an asynchronous normalizer.
   */
  public asyncNormalizer<T>(
    normalizer: AsyncNormalizer<T>,
  ): AsyncValidationNormalizer<T> {
    return createAsyncNormalizer(
      normalizer,
    );
  }

  /**
   * Creates a validation composer.
   */
  public composer<T>(
    steps: readonly ValidationStep<T>[],
    options?: ValidationComposerOptions,
  ): ValidationComposer<T> {
    return createValidationComposer(
      steps,
      options,
    );
  }

  /**
   * Creates a reusable constraint.
   */
  public constraint<T>(
    validateValue: (
      value: T,
    ) => boolean,
    options: {
      readonly name?: string;
      readonly code?: string;
      readonly message?: string;
    } = {},
  ): ValidationConstraint<T> {
    return {
      name:
        options.name ??
        "custom",
      code:
        options.code ??
        "constraint_failed",
      message:
        options.message ??
        "Validation constraint failed.",
      validate:
        validateValue,
    };
  }

  /**
   * Validates a value directly against a schema.
   */
  public validate<T>(
    schema: ValidationSchema<T>,
    value: unknown,
  ): ValidationResult<T> {
    return validate(
      schema,
      value,
    );
  }

  /**
   * Validates a value asynchronously against a schema.
   */
  public validateAsync<T>(
    schema: ValidationSchema<T>,
    value: unknown,
  ): Promise<ValidationResult<T>> {
    return validateAsync(
      schema,
      value,
    );
  }

  /**
   * Validates a value using one or more constraints.
   */
  public check<T>(
    constraints: readonly ValidationConstraint<T>[],
    value: T,
  ): ValidationResult<T> {
    return checkConstraints(
      constraints,
      value,
    );
  }

  /**
   * Registers a schema under a name.
   */
  public registerSchema<T>(
    name: string,
    schema: ValidationSchema<T>,
    description?: string,
  ): this {
    this.registry.registerSchema(
      name,
      schema,
      {
        description,
      },
    );

    return this;
  }

  /**
   * Registers constraints under a name.
   */
  public registerConstraints<T>(
    name: string,
    constraints: readonly ValidationConstraint<T>[],
    description?: string,
  ): this {
    this.registry.registerConstraints(
      name,
      constraints,
      {
        description,
      },
    );

    return this;
  }

  /**
   * Validates using a registered rule.
   */
  public validateRegistered<T>(
    name: string,
    value: unknown,
  ): ValidationResult<T> {
    return this.registry.validate<T>(
      name,
      value,
    );
  }
}

/**
 * Creates a new validation factory.
 */
export function createValidationFactory(
  options: ValidationFactoryOptions = {},
): ValidationFactory {
  return new ValidationFactory(
    options,
  );
}

/**
 * Default validation factory instance.
 *
 * Applications that need isolation should create their own factory.
 */
export const validationFactory =
  createValidationFactory();