/**
 * @oyinlola141/lattice-constants/schema
 *
 * Schema-related constants, issue codes, and default limits.
 */

/** Schema issue codes — machine-readable, stable identifiers. */
export enum SchemaIssueCode {
  INVALID_TYPE = "invalid_type",
  REQUIRED = "required",
  INVALID_LITERAL = "invalid_literal",
  INVALID_ENUM = "invalid_enum",
  INVALID_UNION = "invalid_union",
  INVALID_STRING = "invalid_string",
  INVALID_FORMAT = "invalid_format",
  INVALID_NUMBER = "invalid_number",
  TOO_SMALL = "too_small",
  TOO_LARGE = "too_large",
  INVALID_LENGTH = "invalid_length",
  INVALID_KEY = "invalid_key",
  INVALID_ELEMENT = "invalid_element",
  UNKNOWN_KEYS = "unknown_keys",
  CIRCULAR_REFERENCE = "circular_reference",
  MAX_DEPTH_EXCEEDED = "max_depth_exceeded",
  CUSTOM = "custom",
  PREPROCESS_FAILED = "preprocess_failed",
  TRANSFORM_FAILED = "transform_failed",
  REFINE_FAILED = "refine_failed",
  COERCION_FAILED = "coercion_failed",
}

/** Default maximum depth for schema validation. */
export const SCHEMA_DEFAULT_MAX_DEPTH = 100;

/** Default maximum string length. */
export const SCHEMA_DEFAULT_MAX_STRING_LENGTH = 255;

/** Default maximum array length. */
export const SCHEMA_DEFAULT_MAX_ARRAY_LENGTH = 1000;

/** Default maximum object key count. */
export const SCHEMA_DEFAULT_MAX_OBJECT_KEYS = 100;

/** Object keys that are forbidden for prototype pollution protection. */
export const SCHEMA_FORBIDDEN_KEYS: ReadonlySet<string> = Object.freeze(
  new Set(["__proto__", "constructor", "prototype"]),
);

/** Common string format regex patterns. */
export const SCHEMA_STRING_FORMATS = Object.freeze({
  EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  URL: /^https?:\/\/.+/,
  UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
  UUID_V4: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
  DATETIME: /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/,
  DATE: /^\d{4}-\d{2}-\d{2}$/,
  TIME: /^\d{2}:\d{2}(:\d{2})?$/,
  IPV4: /^(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)$/,
  IPV6: /^([0-9a-f]{1,4}:){7}[0-9a-f]{1,4}$/i,
  HEX_COLOR: /^#[0-9a-f]{6}$/i,
  PHONE: /^\+?[\d\s\-()]+$/,
} as const);
