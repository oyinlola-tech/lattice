/**
 * Serialization-specific constants shared across the Lattice framework.
 *
 * @module common/common.serialization
 */

/** Canonical serialization format names. */
export const SerializationFormat = Object.freeze({
  JSON: "json",
  TEXT: "text",
  BINARY: "binary",
  MESSAGEPACK: "messagepack",
} as const);

/** MIME content types for serialized data. */
export const SerializationContentType = Object.freeze({
  JSON: "application/json",
  TEXT: "text/plain",
  OCTET: "application/octet-stream",
  MSGPACK: "application/msgpack",
} as const);

/** Default limits for serialization operations. */
export const SerializationLimits = Object.freeze({
  /** Default maximum serialized payload size (10 MB). */
  MAX_SIZE: 10 * 1024 * 1024,
  /** Default maximum object nesting depth. */
  MAX_DEPTH: 128,
  /** Maximum number of registered type transformers. */
  MAX_TRANSFORMERS: 256,
  /** Maximum length of a type tag string. */
  MAX_TYPE_TAG_LENGTH: 128,
} as const);

/** Type-tag sentinel keys for JSON representation. */
export const SerializationTags = Object.freeze({
  /** Key for the type discriminator in tagged representations. */
  TYPE: "$type",
  /** Key for the value payload inside a tag. */
  VALUE: "$value",
  /** Key for encoding metadata (e.g. base64 for Buffers). */
  ENCODING: "$encoding",
} as const);

/** Current serialization schema version. */
export const SERIALIZATION_SCHEMA_VERSION = 1;
