import type { ValidationSchema } from "../validationSchema/validationSchema.core.js";
import { validate, validateAsync } from "../validationSchema/validationSchema.core.js";
import type { ValidationResult } from "../validationResult/validationResult.type.js";
import { failure, success } from "../validationResult/validationResult.type.js";
import { ConstraintValidationError } from "../validationErrors/validationError.types.js";

/** A synchronous transformation function. */
export type ValidationTransform<T, U> = (value: T) => U;

/** An asynchronous transformation function. */
export type AsyncValidationTransform<T, U> = (value: T) => U | Promise<U>;

/** Options for transformation operations. */
export interface TransformerOptions {
  readonly name?: string;
  readonly transformErrorMessage?: string;
}

/** A reusable synchronous transformer. */
export interface ValidationTransformer<T, U> {
  readonly name: string;
  transform(value: T): U;
  safeTransform(value: T): ValidationResult<U>;
  validateAndTransform(value: unknown): ValidationResult<U>;
}

/** A reusable asynchronous transformer. */
export interface AsyncValidationTransformer<T, U> {
  readonly name: string;
  transform(value: T): Promise<U>;
  safeTransform(value: T): Promise<ValidationResult<U>>;
  validateAndTransform(value: unknown): Promise<ValidationResult<U>>;
}

function transformFailure<U>(options: TransformerOptions, error: unknown): ValidationResult<U> {
  return failure([{ path: [], code: "transform_failed", message: options.transformErrorMessage ?? "Validation transformation failed.", received: error instanceof Error ? error.message : error }]);
}

/** Creates a synchronous transformer. */
export function createValidationTransformer<T, U>(transform: ValidationTransform<T, U>, options: TransformerOptions = {}): ValidationTransformer<T, U> {
  const name = options.name ?? "ValidationTransformer";
  return Object.freeze({
    name,
    transform(value: T): U {
      try { return transform(value); } catch (error) { throw new ConstraintValidationError(options.transformErrorMessage ?? "Validation transformation failed.", [], { cause: error }); }
    },
    safeTransform(value: T): ValidationResult<U> {
      try { return success(transform(value)); } catch (error) { return transformFailure<U>(options, error); }
    },
    validateAndTransform(value: unknown): ValidationResult<U> { return this.safeTransform(value as T); },
  });
}

/** Creates an asynchronous transformer. */
export function createAsyncValidationTransformer<T, U>(transform: AsyncValidationTransform<T, U>, options: TransformerOptions = {}): AsyncValidationTransformer<T, U> {
  const name = options.name ?? "AsyncValidationTransformer";
  return Object.freeze({
    name,
    async transform(value: T): Promise<U> {
      try { return await transform(value); } catch (error) { throw new ConstraintValidationError(options.transformErrorMessage ?? "Validation transformation failed.", [], { cause: error }); }
    },
    async safeTransform(value: T): Promise<ValidationResult<U>> {
      try { return success(await transform(value)); } catch (error) { return transformFailure<U>(options, error); }
    },
    async validateAndTransform(value: unknown): Promise<ValidationResult<U>> { return this.safeTransform(value as T); },
  });
}

/** Validates input and then transforms it. */
export function validateAndTransform<T, U>(schema: ValidationSchema<T>, value: unknown, transform: ValidationTransform<T, U>, options: TransformerOptions = {}): ValidationResult<U> {
  const validation = validate(schema, value);
  if (!validation.success) return validation;
  try { return success(transform(validation.data)); } catch (error) { return transformFailure<U>(options, error); }
}

/** Validates input and then transforms it asynchronously. */
export async function validateAndTransformAsync<T, U>(schema: ValidationSchema<T>, value: unknown, transform: AsyncValidationTransform<T, U>, options: TransformerOptions = {}): Promise<ValidationResult<U>> {
  const validation = await validateAsync(schema, value);
  if (!validation.success) return validation;
  try { return success(await transform(validation.data)); } catch (error) { return transformFailure<U>(options, error); }
}

/** Creates a transformation pipeline. */
export function composeTransforms<T, U, V>(first: ValidationTransform<T, U>, second: ValidationTransform<U, V>): ValidationTransform<T, V> {
  return (value: T): V => second(first(value));
}

/** Creates a transformation pipeline from multiple functions. */
export function composeManyTransforms<T>(...transforms: readonly ValidationTransform<T, T>[]): ValidationTransform<T, T> {
  return (value: T): T => {
    let current = value;
    for (const transform of transforms) current = transform(current);
    return current;
  };
}

/** Applies a transformation to every item in an array. */
export function transformArray<T, U>(values: readonly T[], transform: ValidationTransform<T, U>): U[] {
  return values.map(transform);
}

/** Applies an asynchronous transformation to every item in an array. */
export async function transformArrayAsync<T, U>(values: readonly T[], transform: AsyncValidationTransform<T, U>): Promise<U[]> {
  return Promise.all(values.map(transform));
}

/** Creates a schema that transforms the validated value. */
export function withTransformer<T, U>(schema: ValidationSchema<T>, transform: ValidationTransform<T, U>): ValidationSchema<U> {
  return schema.transform(transform);
}
