/**
 * Cache strategy type and enum.
 *
 * @module cache/cacheStrategy
 */

/** Type-safe cache strategy string. */
export type CacheStrategy =
  | "no-store"
  | "no-cache"
  | "private"
  | "public"
  | "must-revalidate"
  | "immutable";

/**
 * All supported cache strategies as an object map.
 */
export const CacheStrategies = Object.freeze({
  /** Do not cache the response */
  NO_STORE: "no-store",
  /** Cache but must revalidate before each use */
  NO_CACHE: "no-cache",
  /** Cache only for the requesting user */
  PRIVATE: "private",
  /** Cache for all users */
  PUBLIC: "public",
  /** Cache but always check with the origin server */
  MUST_REVALIDATE: "must-revalidate",
  /** Cache indefinitely, never revalidate */
  IMMUTABLE: "immutable",
} as const);
