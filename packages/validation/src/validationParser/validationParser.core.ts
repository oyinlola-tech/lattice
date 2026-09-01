import type { ValidationSchema } from "../validationSchema/validationSchema.core.js";
import {
  parse,
  parseAsync,
  validate,
  validateAsync,
} from "../validationSchema/validationSchema.core.js";
import type { ValidationResult } from "../validationResult/validationResult.type.js";
import { SchemaValidationError } from "../validationErrors/validationError.types.js";

/** Options for parser creation. */
export interface ParserOptions {
  readonly name?: string;
}

/** A synchronous parser created from a validation schema. */
export interface ValidationParser<T> {
  readonly name: string;
  parse(value: unknown): T;
  safeParse(value: unknown): ValidationResult<T>;
  isValid(value: unknown): value is T;
}

/** An asynchronous parser created from a validation schema. */
export interface AsyncValidationParser<T> {
  readonly name: string;
  parse(value: unknown): Promise<T>;
  safeParse(value: unknown): Promise<ValidationResult<T>>;
  isValid(value: unknown): Promise<boolean>;
}

/** Creates a reusable synchronous parser from a schema. */
export function createValidationParser<T>(
  schema: ValidationSchema<T>,
  options: ParserOptions = {},
): ValidationParser<T> {
  const name = options.name ?? "ValidationParser";
  return Object.freeze({
    name,
    parse(value: unknown): T {
      return parse(schema, value);
    },
    safeParse(value: unknown): ValidationResult<T> {
      return validate(schema, value);
    },
    isValid(value: unknown): value is T {
      return schema.safeParse(value).success;
    },
  });
}

/** Creates a reusable asynchronous parser from a schema. */
export function createAsyncValidationParser<T>(
  schema: ValidationSchema<T>,
  options: ParserOptions = {},
): AsyncValidationParser<T> {
  const name = options.name ?? "AsyncValidationParser";
  return Object.freeze({
    name,
    async parse(value: unknown): Promise<T> {
      return parseAsync(schema, value);
    },
    async safeParse(value: unknown): Promise<ValidationResult<T>> {
      return validateAsync(schema, value);
    },
    async isValid(value: unknown): Promise<boolean> {
      return (await schema.safeParseAsync(value)).success;
    },
  });
}

/** Parses a value and returns a fallback when validation fails. */
export function parseOr<T>(
  schema: ValidationSchema<T>,
  value: unknown,
  fallback: T,
): T {
  const result = validate(schema, value);
  return result.success ? result.data : fallback;
}

/** Parses a value and returns a fallback produced by a function when validation fails. */
export function parseOrElse<T>(
  schema: ValidationSchema<T>,
  value: unknown,
  fallback: (error: SchemaValidationError) => T,
): T {
  const result = validate(schema, value);
  if (result.success) return result.data;
  return fallback(
    new SchemaValidationError("Schema validation failed.", result.issues),
  );
}

/** Parses multiple values using the same schema. Succeeds only when every value is valid. */
export function parseMany<T>(
  schema: ValidationSchema<T>,
  values: readonly unknown[],
): ValidationResult<readonly T[]> {
  const parsed: T[] = [];
  const issues: import("../validationResult/validationResult.type.js").ValidationIssue[] =
    [];

  for (let index = 0; index < values.length; index++) {
    const result = validate(schema, values[index], { pathPrefix: [index] });
    if (result.success) {
      parsed.push(result.data);
    } else {
      issues.push(...result.issues);
    }
  }

  return issues.length > 0
    ? { success: false, data: undefined, issues }
    : { success: true, data: parsed, issues: [] };
}

/** Parses multiple values asynchronously. */
export async function parseManyAsync<T>(
  schema: ValidationSchema<T>,
  values: readonly unknown[],
): Promise<ValidationResult<readonly T[]>> {
  const parsed: T[] = [];
  const issues: import("../validationResult/validationResult.type.js").ValidationIssue[] =
    [];

  for (let index = 0; index < values.length; index++) {
    const result = await validateAsync(schema, values[index], {
      pathPrefix: [index],
    });
    if (result.success) {
      parsed.push(result.data);
    } else {
      issues.push(...result.issues);
    }
  }

  return issues.length > 0
    ? { success: false, data: undefined, issues }
    : { success: true, data: parsed, issues: [] };
}

/** Parses a record of values using a schema. */
export function parseRecord<T>(
  schema: ValidationSchema<T>,
  values: Readonly<Record<string, unknown>>,
): ValidationResult<Readonly<Record<string, T>>> {
  const parsed: Record<string, T> = {};
  const issues: import("../validationResult/validationResult.type.js").ValidationIssue[] =
    [];

  for (const [key, value] of Object.entries(values)) {
    const result = validate(schema, value, { pathPrefix: [key] });
    if (result.success) {
      parsed[key] = result.data;
    } else {
      issues.push(...result.issues);
    }
  }

  return issues.length > 0
    ? { success: false, data: undefined, issues }
    : { success: true, data: Object.freeze(parsed), issues: [] };
}

/** Parses an optional value. Undefined is accepted and returned as undefined. */
export function parseOptional<T>(
  schema: ValidationSchema<T>,
  value: unknown,
): ValidationResult<T | undefined> {
  if (value === undefined)
    return { success: true, data: undefined, issues: [] };
  return validate(schema, value);
}

/** Parses a nullable value. Null is accepted and returned as null. */
export function parseNullable<T>(
  schema: ValidationSchema<T>,
  value: unknown,
): ValidationResult<T | null> {
  if (value === null) return { success: true, data: null, issues: [] };
  return validate(schema, value);
}

/** Parses an optional nullable value. */
export function parseOptionalNullable<T>(
  schema: ValidationSchema<T>,
  value: unknown,
): ValidationResult<T | null | undefined> {
  if (value === undefined || value === null)
    return { success: true, data: value, issues: [] };
  return validate(schema, value);
}
