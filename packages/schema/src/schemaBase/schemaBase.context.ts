/**
 * @zudoliblib/schema/context
 *
 * Context creation and manipulation for schema parsing.
 */

import type {
  SchemaParseContext,
  SchemaParseOptions,
  SchemaIssue,
  SchemaPathSegment,
} from "./schemaBase.type.js";
import { SCHEMA_DEFAULT_MAX_DEPTH } from "@zudoliblib/constants";

/** Creates a fresh parse context from options. */
export function createParseContext(
  options: SchemaParseOptions = {},
): SchemaParseContext {
  return {
    issues: [],
    options,
    seen: new WeakSet(),
    depth: 0,
    path: [...(options.path ?? [])],
  };
}

/** Creates a child context with a deeper path segment. */
export function childContext(
  ctx: SchemaParseContext,
  segment: SchemaPathSegment,
): SchemaParseContext {
  return {
    issues: ctx.issues,
    options: ctx.options,
    seen: ctx.seen,
    depth: ctx.depth + 1,
    path: [...ctx.path, segment],
  };
}

/** Pushes an issue into the context. Returns true if the issue was added. */
export function addIssue(ctx: SchemaParseContext, issue: SchemaIssue): boolean {
  if (
    ctx.options.maxIssues !== undefined &&
    ctx.issues.length >= ctx.options.maxIssues
  ) {
    return false;
  }
  ctx.issues.push(issue);
  return true;
}

/** Checks whether the context has exceeded maximum depth. */
export function isMaxDepthExceeded(ctx: SchemaParseContext): boolean {
  const limit = ctx.options.maxDepth ?? SCHEMA_DEFAULT_MAX_DEPTH;
  return ctx.depth >= limit;
}

/** Returns true if we should abort after the first issue. */
export function shouldAbortEarly(ctx: SchemaParseContext): boolean {
  return ctx.options.abortEarly === true;
}
