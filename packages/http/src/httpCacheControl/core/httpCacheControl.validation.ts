/**
 * Cache control validation.
 *
 * @module httpCacheControl/validation
 */

import type {
  CacheControlDirectives,
} from "./httpCacheControl.type.js";

import { parseCacheControl } from "./httpCacheControl.parse.js";

/**
 * Validates cache control directives for correctness.
 */
export function validateCacheControl(
  header: string | undefined,
): { readonly valid: boolean; readonly errors: readonly string[] } {
  const errors: string[] = [];
  const directives = parseCacheControl(header);

  if (directives.maxAge !== undefined && directives.maxAge < 0) {
    errors.push("max-age must be non-negative");
  }

  if (directives.sMaxAge !== undefined && directives.sMaxAge < 0) {
    errors.push("s-maxage must be non-negative");
  }

  if (directives.maxStale !== undefined && directives.maxStale < 0) {
    errors.push("max-stale must be non-negative");
  }

  if (directives.minFresh !== undefined && directives.minFresh < 0) {
    errors.push("min-fresh must be non-negative");
  }

  if (directives.staleWhileRevalidate !== undefined && directives.staleWhileRevalidate < 0) {
    errors.push("stale-while-revalidate must be non-negative");
  }

  if (directives.staleIfError !== undefined && directives.staleIfError < 0) {
    errors.push("stale-if-error must be non-negative");
  }

  if (directives.private && directives.public) {
    errors.push("cannot have both private and public directives");
  }

  if (directives.noStore && (directives.maxAge !== undefined || directives.sMaxAge !== undefined)) {
    errors.push("no-store is incompatible with max-age/s-maxage");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
