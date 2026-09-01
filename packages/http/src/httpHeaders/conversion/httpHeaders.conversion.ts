/**
 * HTTP header format conversion utilities.
 *
 * @module httpHeaders/conversion
 */

import { HTTPHeaders } from "../http.headers.js";

import type { HTTPHeadersLike } from "../types/httpHeaders.type.js";
import { isIterableHeaders } from "../internal/httpHeaders.internal.typeGuards.js";

/**
 * Converts any supported header format into an {@link HTTPHeaders} instance.
 *
 * @param headers - The headers to convert. If omitted, returns an empty instance.
 * @returns A new {@link HTTPHeaders} instance.
 */
export function toHTTPHeaders(headers?: HTTPHeadersLike): HTTPHeaders {
  if (headers === undefined) {
    return new HTTPHeaders();
  }

  if (headers instanceof HTTPHeaders) {
    return headers.clone();
  }

  const result = new HTTPHeaders();

  if (headers instanceof Headers) {
    headers.forEach((value, name) => {
      result.append(name, value);
    });

    return result;
  }

  if (isIterableHeaders(headers)) {
    for (const entry of headers) {
      if (!Array.isArray(entry) || entry.length !== 2) {
        continue;
      }

      result.append(String(entry[0]), String(entry[1]));
    }

    return result;
  }

  for (const [name, value] of Object.entries(headers)) {
    if (value === undefined || value === null) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        result.append(name, String(item));
      }

      continue;
    }

    result.set(name, String(value));
  }

  return result;
}
