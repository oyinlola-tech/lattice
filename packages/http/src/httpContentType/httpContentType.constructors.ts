/**
 * Common HTTP Content-Type string constructors.
 */

import { MEDIA_TYPES } from "./httpContentType.mediaTypes.js";
import { withCharset } from "./httpContentType.charset.js";
import { withBoundary } from "./httpContentType.boundary.js";

export function jsonContentType(charset?: string): string {
  if (!charset) {
    return MEDIA_TYPES.JSON;
  }

  return withCharset(MEDIA_TYPES.JSON, charset);
}

export function textContentType(charset?: string): string {
  if (!charset) {
    return MEDIA_TYPES.TEXT;
  }

  return withCharset(MEDIA_TYPES.TEXT, charset);
}

export function htmlContentType(charset?: string): string {
  if (!charset) {
    return MEDIA_TYPES.HTML;
  }

  return withCharset(MEDIA_TYPES.HTML, charset);
}

export function formURLEncodedContentType(): string {
  return MEDIA_TYPES.FORM_URLENCODED;
}

export function multipartFormDataContentType(boundary?: string): string {
  if (!boundary) {
    return MEDIA_TYPES.MULTIPART_FORM_DATA;
  }

  return withBoundary(MEDIA_TYPES.MULTIPART_FORM_DATA, boundary);
}

export function octetStreamContentType(): string {
  return MEDIA_TYPES.OCTET_STREAM;
}
