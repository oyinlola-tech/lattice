/**
 * Cache freshness calculations.
 *
 * @module httpCacheControl/freshness
 */

import type { CacheFreshness } from "./core/httpCacheControl.type.js";

import { parseCacheControl } from "./core/httpCacheControl.parse.js";

/**
 * Calculates the freshness of a cached response.
 */
export function calculateFreshness(
  responseHeaders: Readonly<Record<string, string>>,
  responseDate?: Date,
): CacheFreshness {
  const cacheControl = responseHeaders["cache-control"];
  const directives = parseCacheControl(cacheControl);

  const date = responseDate ?? new Date(responseHeaders["date"] ?? Date.now());
  const age = parseInt(responseHeaders["age"] ?? "0", 10) || 0;
  const maxAge = directives.maxAge ?? 0;

  const expiresHeader = responseHeaders["expires"];
  const expires = expiresHeader ? new Date(expiresHeader) : undefined;

  const effectiveMaxAge = maxAge;
  const remaining = Math.max(0, effectiveMaxAge - age);
  const stale = remaining <= 0;

  return {
    maxAge: effectiveMaxAge,
    expires,
    date,
    age,
    stale,
    remaining,
  };
}

/**
 * Determines if a cached response is still fresh.
 */
export function isFresh(
  responseHeaders: Readonly<Record<string, string>>,
  requestHeaders?: Readonly<Record<string, string>>,
): boolean {
  const freshness = calculateFreshness(responseHeaders);

  if (freshness.stale) {
    return false;
  }

  if (requestHeaders) {
    const reqCacheControl = requestHeaders["cache-control"];
    const reqDirectives = parseCacheControl(reqCacheControl);

    if (
      reqDirectives.maxAge !== undefined &&
      freshness.age >= reqDirectives.maxAge
    ) {
      return false;
    }

    if (reqDirectives.minFresh !== undefined) {
      const remaining = freshness.remaining;
      if (remaining < reqDirectives.minFresh) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Gets the remaining freshness in seconds.
 */
export function getRemainingFreshness(
  responseHeaders: Readonly<Record<string, string>>,
): number {
  const freshness = calculateFreshness(responseHeaders);
  return freshness.remaining;
}

/**
 * Determines if a stale response can be served while revalidating.
 */
export function canServeStaleWhileRevalidate(
  responseHeaders: Readonly<Record<string, string>>,
): boolean {
  const cacheControl = responseHeaders["cache-control"];
  const directives = parseCacheControl(cacheControl);
  return (
    directives.staleWhileRevalidate !== undefined &&
    directives.staleWhileRevalidate > 0
  );
}

/**
 * Determines if a stale response can be served on error.
 */
export function canServeStaleIfError(
  responseHeaders: Readonly<Record<string, string>>,
): boolean {
  const cacheControl = responseHeaders["cache-control"];
  const directives = parseCacheControl(cacheControl);
  return directives.staleIfError !== undefined && directives.staleIfError > 0;
}
