/**
 * Basic header existence check utilities.
 *
 * @module httpHeaders/basic
 */

import type { HTTPHeadersLike } from "../types/httpHeaders.type.js";
import { toHTTPHeaders } from "../conversion/httpHeaders.conversion.js";

/**
 * Checks if at least one of the given header names is present.
 *
 * @param headers - The headers to inspect.
 * @param names - The header names to check.
 * @returns `true` if any of the names are present.
 */
export function hasAnyHeader(
  headers:
    | HTTPHeadersLike,
  names:
    | readonly string[],
): boolean {
  const normalized =
    toHTTPHeaders(
      headers,
    );

  return names.some(
    (
      name,
    ) =>
      normalized.has(
        name,
      ),
  );
}

/**
 * Checks if all of the given header names are present.
 *
 * @param headers - The headers to inspect.
 * @param names - The header names to check.
 * @returns `true` if all names are present.
 */
export function hasAllHeaders(
  headers:
    | HTTPHeadersLike,
  names:
    | readonly string[],
): boolean {
  const normalized =
    toHTTPHeaders(
      headers,
    );

  return names.every(
    (
      name,
    ) =>
      normalized.has(
        name,
      ),
  );
}
