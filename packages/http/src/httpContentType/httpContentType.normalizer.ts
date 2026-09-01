/**
 * HTTP Content-Type normalization utilities.
 */

import type { ContentType } from "./httpContentType.type.js";
import { parseContentType } from "./httpContentType.parser.js";
import { formatContentType } from "./httpContentType.formatter.js";

export function normalizeContentType(
  value: string | ContentType | undefined | null,
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value !== "string") {
    return formatContentType(value);
  }

  const parsed = parseContentType(value);

  if (!parsed) {
    return undefined;
  }

  return formatContentType(parsed);
}

export function getMediaType(
  value: string | ContentType | undefined | null,
): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const parsed = typeof value === "string" ? parseContentType(value) : value;

  if (!parsed) {
    return undefined;
  }

  return `${parsed.type}/${parsed.subtype}`;
}
