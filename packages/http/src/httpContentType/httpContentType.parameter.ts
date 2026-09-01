/**
 * HTTP Content-Type generic parameter helpers.
 */

import type { ContentType } from "./httpContentType.type.js";
import { parseContentType } from "./httpContentType.parser.js";

export function getParameter(
  value: string | ContentType | undefined | null,
  name: string,
): string | undefined {
  const parsed = typeof value === "string" ? parseContentType(value) : value;

  if (!parsed) {
    return undefined;
  }

  return parsed.parameters[name.trim().toLowerCase()];
}

export function hasParameter(
  value: string | ContentType | undefined | null,
  name: string,
): boolean {
  return getParameter(value, name) !== undefined;
}
