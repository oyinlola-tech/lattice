/**
 * MIME content type constants.
 *
 * @module http/httpContentType
 */

/** Type-safe MIME content type string. */
export type ContentType = string;

/**
 * Common MIME content types.
 */
export const ContentTypes = Object.freeze({
  JSON: "application/json",
  XML: "application/xml",
  FORM_URLENCODED: "application/x-www-form-urlencoded",
  MULTIPART_FORM_DATA: "multipart/form-data",
  TEXT_PLAIN: "text/plain",
  TEXT_HTML: "text/html",
  TEXT_CSS: "text/css",
  TEXT_CSV: "text/csv",
  TEXT_JAVASCRIPT: "text/javascript",
  OCTET_STREAM: "application/octet-stream",
  PDF: "application/pdf",
  ZIP: "application/zip",
  GZIP: "application/gzip",
  IMAGE_PNG: "image/png",
  IMAGE_JPEG: "image/jpeg",
  IMAGE_GIF: "image/gif",
  IMAGE_SVG_XML: "image/svg+xml",
  IMAGE_WEBP: "image/webp",
  AUDIO_MPEG: "audio/mpeg",
  VIDEO_MP4: "video/mp4",
  WILDCARD: "*/*",
} as const);

/**
 * Common charset values.
 */
export const Charset = Object.freeze({
  UTF_8: "utf-8",
  ASCII: "ascii",
  ISO_8859_1: "iso-8859-1",
  UTF_16: "utf-16",
} as const);

/**
 * Build a Content-Type header value with optional charset.
 *
 * @param mimeType - The MIME type (e.g. ContentTypes.JSON)
 * @param charset - Optional charset (e.g. Charset.UTF_8)
 * @returns Full Content-Type string (e.g. "application/json; charset=utf-8")
 */
export function buildContentType(mimeType: ContentType, charset?: string): string {
  return charset ? `${mimeType}; charset=${charset}` : mimeType;
}
