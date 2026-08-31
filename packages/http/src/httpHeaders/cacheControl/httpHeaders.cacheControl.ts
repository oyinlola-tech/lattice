/**
 * Cache-Control header inspection utilities.
 *
 * @module httpHeaders/cacheControl
 */

import type { HTTPHeadersLike } from "../types/httpHeaders.type.js";
import { toHTTPHeaders } from "../conversion/httpHeaders.conversion.js";
import { parseCacheControl } from "./httpHeaders.cacheControlParse.js";

/**
 * Retrieves parsed Cache-Control directives from headers.
 *
 * @param headers - The headers to inspect.
 * @returns Parsed cache control directives.
 */
export function parseCacheControlFromHeaders(
  headers:
    | HTTPHeadersLike,
): import("../types/httpHeaders.type.js").CacheControlDirectives {
  return parseCacheControl(
    toHTTPHeaders(
      headers,
    ).get(
      "cache-control",
    ),
  );
}

/**
 * Checks if a specific Cache-Control directive is present.
 *
 * @param headers - The headers to inspect.
 * @param directive - The directive name to check.
 * @returns `true` if the directive is present.
 */
export function hasCacheDirective(
  headers:
    | HTTPHeadersLike,
  directive:
    | string,
): boolean {
  const parsed =
    parseCacheControlFromHeaders(
      headers,
    );

  return Object.prototype.hasOwnProperty.call(
    parsed.directives,
    directive
      .trim()
      .toLowerCase(),
  );
}
