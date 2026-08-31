/**
 * Route pattern factory.
 *
 * @module httpRoute/pattern/factory
 */

import type {
  CompiledRoutePattern,
  RoutePatternOptions,
} from "./core/httpPattern.type.js";

import { compileRoutePattern } from "./core/httpPattern.compilation.js";

/**
 * Creates a compiled route pattern from a string.
 */
export function createRoutePattern(
  pattern: string,
  options?: RoutePatternOptions,
): CompiledRoutePattern {
  return compileRoutePattern(pattern, options);
}

/**
 * Creates a strict route pattern (exact match required).
 */
export function createStrictRoutePattern(
  pattern: string,
): CompiledRoutePattern {
  return compileRoutePattern(pattern, { strict: true, end: true });
}

/**
 * Creates a case-insensitive route pattern.
 */
export function createCaseInsensitiveRoutePattern(
  pattern: string,
): CompiledRoutePattern {
  return compileRoutePattern(pattern, { caseSensitive: false });
}
