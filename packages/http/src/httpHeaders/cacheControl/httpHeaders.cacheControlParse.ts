/**
 * Cache-Control header parsing internals.
 *
 * @module httpHeaders/cacheControlParse
 */

import type { CacheControlDirectives } from "../types/httpHeaders.type.js";
import { splitHeaderValues } from "../list/httpHeaders.list.js";
import { parseDirectiveTokens } from "./httpHeaders.cacheControlTokens.js";
import { buildDirectives } from "./httpHeaders.cacheControlBuilder.js";

/**
 * Parses a raw Cache-Control header value into structured directives.
 *
 * @param value - The raw Cache-Control header value.
 * @returns Parsed cache control directives.
 */
export function parseCacheControl(
  value: string | undefined,
): CacheControlDirectives {
  const items = splitHeaderValues(value);

  const directives = parseDirectiveTokens(items);

  return buildDirectives(directives);
}
