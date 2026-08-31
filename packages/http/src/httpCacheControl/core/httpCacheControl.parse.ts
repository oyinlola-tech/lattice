/**
 * Cache control header parsing and formatting.
 *
 * @module httpCacheControl/parsing
 */

import type {
  CacheControlDirectives,
  CacheControlOptions,
} from "./httpCacheControl.type.js";

import {
  CACHE_CONTROL_HEADER,
} from "./httpCacheControl.type.js";

/**
 * Parses a Cache-Control header value into directives.
 */
export function parseCacheControl(
  header: string | undefined,
): CacheControlDirectives {
  if (!header) {
    return {};
  }

  const directives: Record<string, string | boolean> = {};
  const parts = header.split(",");

  for (const part of parts) {
    const trimmed = part.trim();
    const eqIndex = trimmed.indexOf("=");

    if (eqIndex === -1) {
      directives[trimmed.toLowerCase()] = true;
    } else {
      const key = trimmed.slice(0, eqIndex).trim().toLowerCase();
      const value = trimmed.slice(eqIndex + 1).trim();
      directives[key] = value;
    }
  }

  return {
    noCache: directives["no-cache"] === true || typeof directives["no-cache"] === "string",
    noStore: directives["no-store"] === true,
    noTransform: directives["no-transform"] === true,
    onlyIfCached: directives["only-if-cached"] === true,
    maxAge: parseDirectiveValue(directives["max-age"]),
    maxStale: parseDirectiveValue(directives["max-stale"]),
    minFresh: parseDirectiveValue(directives["min-fresh"]),
    sMaxAge: parseDirectiveValue(directives["s-maxage"]),
    mustRevalidate: directives["must-revalidate"] === true,
    proxyRevalidate: directives["proxy-revalidate"] === true,
    mustUnderstand: directives["must-understand"] === true,
    private: directives["private"] === true,
    public: directives["public"] === true,
    immutable: directives["immutable"] === true,
    staleWhileRevalidate: parseDirectiveValue(directives["stale-while-revalidate"]),
    staleIfError: parseDirectiveValue(directives["stale-if-error"]),
    noCacheHeaders: parseNoCacheHeaders(directives["no-cache"]),
  };
}

function parseDirectiveValue(
  value: string | boolean | undefined,
): number | undefined {
  if (typeof value === "boolean") {
    return value ? 0 : undefined;
  }
  if (typeof value === "string") {
    const num = parseInt(value, 10);
    return isNaN(num) ? undefined : num;
  }
  return undefined;
}

function parseNoCacheHeaders(
  value: string | boolean | undefined,
): readonly string[] | undefined {
  if (typeof value !== "string" || value === "") {
    return undefined;
  }
  return value.split("=").slice(1).map((h) => h.trim().replace(/"/g, ""));
}

/**
 * Formats CacheControlDirectives into a Cache-Control header string.
 */
export function formatCacheControl(
  directives: CacheControlOptions,
): string {
  const parts: string[] = [];

  if (directives.maxAge !== undefined) {
    parts.push(`max-age=${directives.maxAge}`);
  }
  if (directives.sMaxAge !== undefined) {
    parts.push(`s-maxage=${directives.sMaxAge}`);
  }
  if (directives.noCache) {
    parts.push("no-cache");
  }
  if (directives.noStore) {
    parts.push("no-store");
  }
  if (directives.mustRevalidate) {
    parts.push("must-revalidate");
  }
  if (directives.proxyRevalidate) {
    parts.push("proxy-revalidate");
  }
  if (directives.private) {
    parts.push("private");
  }
  if (directives.public) {
    parts.push("public");
  }
  if (directives.immutable) {
    parts.push("immutable");
  }
  if (directives.staleWhileRevalidate !== undefined) {
    parts.push(`stale-while-revalidate=${directives.staleWhileRevalidate}`);
  }
  if (directives.staleIfError !== undefined) {
    parts.push(`stale-if-error=${directives.staleIfError}`);
  }
  if (directives.noTransform) {
    parts.push("no-transform");
  }
  if (directives.onlyIfCached) {
    parts.push("only-if-cached");
  }

  return parts.join(", ");
}
