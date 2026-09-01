/**
 * Cache control factory.
 *
 * @module httpCacheControl/factory
 */

import type { CacheControlOptions } from "./core/httpCacheControl.type.js";

import { formatCacheControl } from "./core/httpCacheControl.parse.js";

/**
 * Creates a Cache-Control header string from options.
 */
export function createCacheControl(options: CacheControlOptions = {}): string {
  return formatCacheControl(options);
}

/**
 * Creates a no-cache header.
 */
export function createNoCacheHeader(): string {
  return createCacheControl({ noCache: true, maxAge: 0 });
}

/**
 * Creates a no-store header.
 */
export function createNoStoreHeader(): string {
  return createCacheControl({ noStore: true });
}

/**
 * Creates a public cache header with max-age.
 */
export function createPublicCacheHeader(maxAge: number): string {
  return createCacheControl({ public: true, maxAge });
}

/**
 * Creates a private cache header with max-age.
 */
export function createPrivateCacheHeader(maxAge: number): string {
  return createCacheControl({ private: true, maxAge });
}

/**
 * Creates an immutable cache header.
 */
export function createImmutableCacheHeader(maxAge: number): string {
  return createCacheControl({ public: true, maxAge, immutable: true });
}

/**
 * Creates a stale-while-revalidate header.
 */
export function createStaleWhileRevalidateHeader(
  maxAge: number,
  staleWhileRevalidate: number,
): string {
  return createCacheControl({
    public: true,
    maxAge,
    staleWhileRevalidate,
  });
}
