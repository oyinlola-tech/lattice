/**
 * Cache-Control directive builder.
 *
 * @module httpHeaders/cacheControlBuilder
 */

import type { CacheControlDirectives } from "../types/httpHeaders.type.js";
import { hasDirective, getDirectiveNumber } from "../internal/httpHeaders.internal.cacheControl.js";

/**
 * Constructs a CacheControlDirectives object from a directives record.
 *
 * @param directives - The parsed directives record.
 * @returns Structured cache control directives.
 */
export function buildDirectives(
  directives:
    | Record<
        string,
        string | true
      >,
): CacheControlDirectives {
  return {
    noCache:
      hasDirective(
        directives,
        "no-cache",
      ),

    noStore:
      hasDirective(
        directives,
        "no-store",
      ),

    noTransform:
      hasDirective(
        directives,
        "no-transform",
      ),

    onlyIfCached:
      hasDirective(
        directives,
        "only-if-cached",
      ),

    public:
      hasDirective(
        directives,
        "public",
      ),

    private:
      hasDirective(
        directives,
        "private",
      ),

    mustRevalidate:
      hasDirective(
        directives,
        "must-revalidate",
      ),

    proxyRevalidate:
      hasDirective(
        directives,
        "proxy-revalidate",
      ),

    immutable:
      hasDirective(
        directives,
        "immutable",
      ),

    maxAge:
      getDirectiveNumber(
        directives,
        "max-age",
      ),

    sMaxAge:
      getDirectiveNumber(
        directives,
        "s-maxage",
      ),

    staleWhileRevalidate:
      getDirectiveNumber(
        directives,
        "stale-while-revalidate",
      ),

    staleIfError:
      getDirectiveNumber(
        directives,
        "stale-if-error",
      ),

    mustUnderstand:
      hasDirective(
        directives,
        "must-understand",
      ),

    directives:
      Object.freeze(
        directives,
      ),
  };
}
