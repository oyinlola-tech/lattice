/**
 * Content negotiation media type matching utilities.
 *
 * @module httpHeaders/contentNegotiation
 */

import type { HTTPHeadersLike } from "../types/httpHeaders.type.js";
import { toHTTPHeaders } from "../conversion/httpHeaders.conversion.js";
import { splitHeaderValues } from "../list/httpHeaders.list.js";
import { parseMediaType } from "../internal/httpHeaders.internal.mediaType.js";
import { mediaTypeSpecificity } from "../internal/httpHeaders.internal.specificity.js";

/**
 * Checks if the Accept header permits a given media type.
 *
 * @param headers - The headers to inspect.
 * @param mediaType - The media type to check (e.g. `"text/html"`).
 * @returns `true` if the media type is accepted (or if no Accept header is present).
 */
export function accepts(headers: HTTPHeadersLike, mediaType: string): boolean {
  const value = toHTTPHeaders(headers).get("accept");

  if (!value) {
    return true;
  }

  const target = parseMediaType(mediaType);

  if (!target) {
    return false;
  }

  const accepted = splitHeaderValues(value);

  for (const item of accepted) {
    const parsed = parseMediaType(item);

    if (!parsed) {
      continue;
    }

    if (parsed.type === "*" || parsed.type === target.type) {
      if (parsed.subtype === "*" || parsed.subtype === target.subtype) {
        return true;
      }

      if (
        parsed.subtype.startsWith("*+") &&
        target.subtype.endsWith(parsed.subtype.slice(1))
      ) {
        return true;
      }
    }
  }

  return false;
}
