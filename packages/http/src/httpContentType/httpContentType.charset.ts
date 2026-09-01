/**
 * HTTP Content-Type charset parameter helpers.
 */

import type { ContentType } from "./httpContentType.type.js";
import { parseContentType } from "./httpContentType.parser.js";
import { formatContentType } from "./httpContentType.formatter.js";

export function getCharset(
  value: string | ContentType | undefined | null,
): string | undefined {
  const parsed = typeof value === "string" ? parseContentType(value) : value;

  return parsed?.parameters.charset;
}

export function hasCharset(
  value: string | ContentType | undefined | null,
): boolean {
  return getCharset(value) !== undefined;
}

export function withCharset(
  value: string | ContentType,
  charset: string,
): string {
  const parsed = typeof value === "string" ? parseContentType(value) : value;

  if (!parsed) {
    throw new TypeError("Invalid content type.");
  }

  const parameters = {
    ...parsed.parameters,
    charset: charset.trim().toLowerCase(),
  };

  return formatContentType({
    ...parsed,
    parameters,
  });
}
