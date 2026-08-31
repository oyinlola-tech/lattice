/**
 * Route pattern matching.
 *
 * @module httpRoute/pattern/matching
 */

import type {
  CompiledRoutePattern,
  RouteMatch,
} from "./httpPattern.type.js";

/**
 * Tests if a path matches a compiled route pattern.
 */
export function testRoutePattern(
  pattern: CompiledRoutePattern,
  path: string,
): boolean {
  return pattern.regex.test(path);
}

/**
 * Matches a path against a compiled route pattern.
 */
export function matchRoutePattern(
  pattern: CompiledRoutePattern,
  path: string,
): RouteMatch | undefined {
  const match = path.match(pattern.regex);

  if (!match) {
    return undefined;
  }

  const params: Record<string, string> = {};

  for (const name of pattern.paramNames) {
    const value = match.groups?.[name];
    if (value !== undefined) {
      params[name] = decodeURIComponent(value);
    }
  }

  return {
    params,
    path,
    pattern: pattern.original,
  };
}

/**
 * Matches a path against multiple compiled route patterns.
 */
export function matchRoutePatterns(
  patterns: readonly CompiledRoutePattern[],
  path: string,
): RouteMatch | undefined {
  for (const pattern of patterns) {
    const match = matchRoutePattern(pattern, path);
    if (match) {
      return match;
    }
  }
  return undefined;
}

/**
 * Tests if a path matches any of the compiled route patterns.
 */
export function testRoutePatterns(
  patterns: readonly CompiledRoutePattern[],
  path: string,
): boolean {
  return patterns.some((p) => testRoutePattern(p, path));
}
