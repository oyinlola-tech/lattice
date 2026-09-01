/**
 * HTTP Content-Type matching utilities.
 */

import type {
  ContentType,
  ContentTypeMatchOptions,
} from "./httpContentType.type.js";
import { parseContentType } from "./httpContentType.parser.js";

function matchesToken(
  actual: string,
  expected: string,
  allowWildcard: boolean,
): boolean {
  if (actual === expected) {
    return true;
  }

  if (!allowWildcard) {
    return false;
  }

  return actual === "*" || expected === "*";
}

export function matchesContentType(
  value: string | ContentType | undefined | null,
  expected: string | ContentType,
  options: ContentTypeMatchOptions = {},
): boolean {
  const actual = typeof value === "string" ? parseContentType(value) : value;

  const target =
    typeof expected === "string" ? parseContentType(expected) : expected;

  if (!actual || !target) {
    return false;
  }

  const allowWildcard = options.allowWildcard ?? true;

  if (!matchesToken(actual.type, target.type, allowWildcard)) {
    return false;
  }

  if (!matchesToken(actual.subtype, target.subtype, allowWildcard)) {
    return false;
  }

  if (options.ignoreParameters) {
    return true;
  }

  for (const [name, expectedValue] of Object.entries(target.parameters)) {
    const actualValue = actual.parameters[name];

    if (actualValue === undefined) {
      return false;
    }

    if (actualValue.toLowerCase() !== expectedValue.toLowerCase()) {
      return false;
    }
  }

  return true;
}
