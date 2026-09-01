/**
 * Common HTTP media type constants.
 */

export const MEDIA_TYPES = {
  JSON: "application/json",
  JSON_PATCH: "application/json-patch+json",
  JSON_API: "application/vnd.api+json",
  TEXT: "text/plain",
  HTML: "text/html",
  CSS: "text/css",
  JAVASCRIPT: "text/javascript",
  XML: "application/xml",
  FORM_URLENCODED: "application/x-www-form-urlencoded",
  MULTIPART_FORM_DATA: "multipart/form-data",
  OCTET_STREAM: "application/octet-stream",
  PDF: "application/pdf",
  ZIP: "application/zip",
  GZIP: "application/gzip",
  FORM_DATA: "multipart/form-data",
} as const;
