/**
 * HTTP header format conversion to native and object formats.
 *
 * @module httpHeaders/conversionObject
 */

import type { HTTPHeadersLike } from "../types/httpHeaders.type.js";
import { toHTTPHeaders } from "../conversion/httpHeaders.conversion.js";

/**
 * Converts any supported header format into a native {@link Headers} instance.
 *
 * @param headers - The headers to convert. If omitted, returns an empty Headers.
 * @returns A new {@link Headers} instance.
 */
export function toHeaders(
  headers?:
    | HTTPHeadersLike,
): Headers {
  const result =
    new Headers();

  const normalized =
    toHTTPHeaders(
      headers,
    );

  normalized.forEach(
    (
      value,
      name,
    ) => {
      result.append(
        name,
        value,
      );
    },
  );

  return result;
}

/**
 * Converts any supported header format into a plain `Record<string, string>`.
 *
 * @param headers - The headers to convert. If omitted, returns an empty object.
 * @returns A plain object with lowercased header names as keys.
 */
export function toHeaderObject(
  headers?:
    | HTTPHeadersLike,
): Record<string, string> {
  return toHTTPHeaders(
    headers,
  ).toObject();
}
