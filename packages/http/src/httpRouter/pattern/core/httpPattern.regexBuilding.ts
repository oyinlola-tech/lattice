/**
 * Regex building for route patterns.
 *
 * @module httpRoute/pattern/regexBuilding
 */

import type {
  RouteSegment,
  ParameterRouteSegment,
  RoutePatternOptions,
} from "./httpPattern.type.js";

/**
 * Builds a regex from route segments.
 */
export function buildRegex(
  segments: readonly RouteSegment[],
  options: RoutePatternOptions,
): RegExp {
  let regexStr = "^";

  for (const segment of segments) {
    switch (segment.type) {
      case "static":
        regexStr += escapeRegex(segment.value);
        break;
      case "parameter":
        regexStr += compileParameterExpression(segment);
        break;
      case "wildcard":
        regexStr += "(.*)";
        break;
    }
  }

  if (options.end !== false) {
    regexStr += "$";
  }

  const flags = options.caseSensitive ? "" : "i";
  return new RegExp(regexStr, flags);
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function compileParameterExpression(segment: ParameterRouteSegment): string {
  if (segment.optional) {
    return `(?<${segment.name}>[^/]*)?`;
  }
  return `(?<${segment.name}>[^/]+)`;
}
