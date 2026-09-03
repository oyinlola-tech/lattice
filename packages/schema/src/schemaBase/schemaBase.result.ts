/**
 * @zudo/schema/result
 *
 * Result constructors and type guards for schema outcomes.
 */

import type {
  SchemaResult,
  SchemaSuccess,
  SchemaFailure,
  SchemaIssue,
} from "./schemaBase.type.js";

/** Creates a successful result. */
export function schemaSuccess<T>(data: T): SchemaSuccess<T> {
  return { success: true, data } as const;
}

/** Creates a failure result. */
export function schemaFailure(issues: readonly SchemaIssue[]): SchemaFailure {
  return { success: false, issues } as const;
}

/** Type guard for successful results. */
export function isSchemaSuccess<T>(
  result: SchemaResult<T>,
): result is SchemaSuccess<T> {
  return result.success === true;
}

/** Type guard for failure results. */
export function isSchemaFailure<T>(
  result: SchemaResult<T>,
): result is SchemaFailure {
  return result.success === false;
}

/** Unwraps a result, throwing on failure. */
export function unwrapSchemaResult<T>(result: SchemaResult<T>): T {
  if (result.success) {
    return result.data;
  }
  throw new Error(
    `Schema validation failed with ${result.issues.length} issue(s): ${result.issues
      .map((i) => i.message)
      .join("; ")}`,
  );
}
