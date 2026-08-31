/**
 * HTTP Content-Type category detection helpers (JSON, XML, text).
 */

import type {
  ContentType,
} from "./httpContentType.type.js";
import {
  getMediaType,
} from "./httpContentType.normalizer.js";
import {
  matchesContentType,
} from "./httpContentType.matcher.js";

export function isJSON(
  value:
    | string
    | ContentType
    | undefined
    | null,
): boolean {
  return (
    matchesContentType(
      value,
      "application/json",
    ) || isStructuredJSON(value)
  );
}

export function isStructuredJSON(
  value:
    | string
    | ContentType
    | undefined
    | null,
): boolean {
  const mediaType =
    getMediaType(value);

  return (
    mediaType?.endsWith("+json") ??
    false
  );
}

export function isText(
  value:
    | string
    | ContentType
    | undefined
    | null,
): boolean {
  const mediaType =
    getMediaType(value);

  return (
    mediaType?.startsWith("text/") ??
    false
  );
}

export function isXML(
  value:
    | string
    | ContentType
    | undefined
    | null,
): boolean {
  const mediaType =
    getMediaType(value);

  return (
    mediaType ===
      "application/xml" ||
    mediaType === "text/xml" ||
    mediaType?.endsWith("+xml") ===
      true
  );
}
