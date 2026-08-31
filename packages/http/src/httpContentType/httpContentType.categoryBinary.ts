/**
 * HTTP Content-Type category detection helpers (forms, multipart, binary).
 */

import type {
  ContentType,
} from "./httpContentType.type.js";
import {
  MEDIA_TYPES,
} from "./httpContentType.mediaTypes.js";
import {
  getMediaType,
} from "./httpContentType.normalizer.js";
import {
  matchesContentType,
} from "./httpContentType.matcher.js";

export function isFormURLEncoded(
  value:
    | string
    | ContentType
    | undefined
    | null,
): boolean {
  return matchesContentType(
    value,
    MEDIA_TYPES.FORM_URLENCODED,
  );
}

export function isMultipart(
  value:
    | string
    | ContentType
    | undefined
    | null,
): boolean {
  const mediaType =
    getMediaType(value);

  return (
    mediaType?.startsWith(
      "multipart/",
    ) ?? false
  );
}

export function isMultipartFormData(
  value:
    | string
    | ContentType
    | undefined
    | null,
): boolean {
  return matchesContentType(
    value,
    MEDIA_TYPES.MULTIPART_FORM_DATA,
  );
}

export function isBinary(
  value:
    | string
    | ContentType
    | undefined
    | null,
): boolean {
  const mediaType =
    getMediaType(value);

  if (!mediaType) {
    return false;
  }

  return (
    mediaType ===
      MEDIA_TYPES.OCTET_STREAM ||
    mediaType ===
      MEDIA_TYPES.PDF ||
    mediaType ===
      MEDIA_TYPES.ZIP ||
    mediaType ===
      MEDIA_TYPES.GZIP ||
    mediaType.startsWith("image/") ||
    mediaType.startsWith("audio/") ||
    mediaType.startsWith("video/")
  );
}
