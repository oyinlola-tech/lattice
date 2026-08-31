/**
 * Common default values, limits, and sentinel constants.
 *
 * @module common/common
 */

import {
  type UserId,
  type EventId,
  type RequestId,
  type CorrelationId,
  type Timestamp,
} from "./common.type.js";

/** Sentinel value indicating absence of a value. */
export const NONE = "NONE" as const;

/** Sentinel value indicating an uninitialized state. */
export const UNINITIALIZED = "UNINITIALIZED" as const;

/** Generic placeholder for empty string contexts. */
export const EMPTY = "" as const;

/**
 * Default numeric limits used across the framework.
 */
export const Limits = Object.freeze({
  /** Maximum string length for display fields */
  MAX_DISPLAY_LENGTH: 255,
  /** Maximum string length for long text fields */
  MAX_TEXT_LENGTH: 10_000,
  /** Maximum string length for short identifiers */
  MAX_ID_LENGTH: 128,
  /** Maximum number of items in a list/page */
  MAX_PAGE_SIZE: 100,
  /** Default page size for paginated queries */
  DEFAULT_PAGE_SIZE: 20,
  /** Maximum depth for nested structures */
  MAX_NESTING_DEPTH: 10,
  /** Maximum number of retry attempts */
  MAX_RETRY_ATTEMPTS: 5,
  /** Maximum number of concurrent operations */
  MAX_CONCURRENCY: 10,
  /** Maximum buffer size (64 KB) */
  MAX_BUFFER_SIZE: 65_536,
  /** Maximum file size (10 MB) */
  MAX_FILE_SIZE: 10_485_760,
} as const);

/**
 * Default configuration values for common options.
 */
export const Defaults = Object.freeze({
  /** Default character encoding */
  ENCODING: "utf-8",
  /** Default MIME type */
  CONTENT_TYPE: "application/json",
  /** Default date format (ISO 8601) */
  DATE_FORMAT: "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'",
  /** Default time zone */
  TIMEZONE: "UTC",
  /** Default locale */
  LOCALE: "en-US",
  /** Default port number */
  PORT: 3000,
  /** Default hostname */
  HOSTNAME: "localhost",
  /** Default protocol */
  PROTOCOL: "http",
  /** Default salt rounds for hashing */
  SALT_ROUNDS: 12,
} as const);

/**
 * Sentinel values for special states.
 */
export const Sentinel = Object.freeze({
  /** Value indicating null/absence in serialized form */
  NULL: null,
  /** Value indicating undefined in serialized form */
  UNDEFINED: undefined,
  /** Marker for deleted soft-delete records */
  DELETED: "__DELETED__",
  /** Marker for placeholder data */
  PLACEHOLDER: "__PLACEHOLDER__",
  /** Wildcard for matching all */
  WILDCARD: "*",
} as const);

/**
 * Create a branded UserId from a raw string.
 */
export function createUserId(id: string): UserId {
  return id as UserId;
}

/**
 * Create a branded EventId from a raw string.
 */
export function createEventId(id: string): EventId {
  return id as EventId;
}

/**
 * Create a branded RequestId from a raw string.
 */
export function createRequestId(id: string): RequestId {
  return id as RequestId;
}

/**
 * Create a branded CorrelationId from a raw string.
 */
export function createCorrelationId(id: string): CorrelationId {
  return id as CorrelationId;
}

/**
 * Create a branded Timestamp from an ISO 8601 string.
 */
export function createTimestamp(iso: string): Timestamp {
  return iso as Timestamp;
}
