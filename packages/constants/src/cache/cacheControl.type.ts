/**
 * Cache control header constants and builder.
 *
 * @module cache/cacheControl
 */

import { type CacheStrategy } from "./cacheStrategy.type.js";
import { TimeMs } from "../time/time.constant.js";

/**
 * Default cache durations in seconds for different resource types.
 */
export const CacheDuration = Object.freeze({
  /** No caching */
  NONE: 0,
  /** Very short cache (10 seconds) — API data */
  SHORT: 10,
  /** Medium cache (5 minutes) — semi-dynamic content */
  MEDIUM: 300,
  /** Long cache (1 hour) — static content */
  LONG: 3_600,
  /** Very long cache (1 day) — immutable assets */
  VERY_LONG: 86_400,
  /** One week — versioned assets */
  WEEK: 604_800,
} as const);

/**
 * Options for building a Cache-Control header value.
 */
export interface CacheControlOptions {
  /** The caching strategy */
  readonly strategy: CacheStrategy;
  /** Max age in seconds */
  readonly maxAge?: number;
  /** Stale-while-revalidate duration in seconds */
  readonly staleWhileRevalidate?: number;
  /** Whether to include the s-maxage directive */
  readonly sharedMaxAge?: number;
}

/**
 * Build a Cache-Control header value from options.
 *
 * @param options - Cache control options
 * @returns Cache-Control header string
 */
export function buildCacheControl(options: CacheControlOptions): string {
  const parts: string[] = [options.strategy];
  if (options.maxAge !== undefined) {
    parts.push(`max-age=${options.maxAge}`);
  }
  if (options.staleWhileRevalidate !== undefined) {
    parts.push(`stale-while-revalidate=${options.staleWhileRevalidate}`);
  }
  if (options.sharedMaxAge !== undefined) {
    parts.push(`s-maxage=${options.sharedMaxAge}`);
  }
  return parts.join(", ");
}
