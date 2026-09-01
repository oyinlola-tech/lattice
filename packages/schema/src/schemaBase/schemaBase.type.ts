/**
 * @oyinlola141/lattice-schema/types
 *
 * Core types for the Lattice schema system.
 */

import type { SchemaIssueCode } from "@oyinlola141/lattice-constants";

/** A single segment in a validation path. */
export type SchemaPathSegment = string | number;

/** A structured validation issue with machine-readable code. */
export interface SchemaIssue {
  readonly code: SchemaIssueCode | string;
  readonly path: readonly SchemaPathSegment[];
  readonly message: string;
  readonly expected?: string;
  readonly received?: string;
  readonly input?: unknown;
  readonly details?: Record<string, unknown>;
}

/** Successful validation result. */
export interface SchemaSuccess<T> {
  readonly success: true;
  readonly data: T;
}

/** Failed validation result. */
export interface SchemaFailure {
  readonly success: false;
  readonly issues: readonly SchemaIssue[];
}

/** Discriminated union result type. */
export type SchemaResult<T> = SchemaSuccess<T> | SchemaFailure;

/** Options for schema parsing. */
export interface SchemaParseOptions {
  /** Whether to stop at the first error. */
  readonly abortEarly?: boolean;
  /** Maximum nesting depth. */
  readonly maxDepth?: number;
  /** Maximum number of issues to collect. */
  readonly maxIssues?: number;
  /** Current path in the data tree. */
  readonly path?: readonly SchemaPathSegment[];
}

/** Internal parsing context passed through recursive validation. */
export interface SchemaParseContext {
  readonly issues: SchemaIssue[];
  readonly options: SchemaParseOptions;
  readonly seen: WeakSet<object>;
  readonly depth: number;
  readonly path: SchemaPathSegment[];
}

/** Schema metadata for OpenAPI/JSON Schema generation. */
export interface SchemaMetadata {
  readonly description?: string;
  readonly example?: unknown;
  readonly deprecated?: boolean;
  readonly title?: string;
}
