/**
 * Content-Range header formatting and parsing utilities.
 *
 * @module httpHeaders/contentRange
 */

import type { ByteRange, ContentRange } from "../types/httpHeaders.type.js";
import { resolveRange } from "./httpHeaders.rangeResolution.js";

/**
 * Formats a Content-Range header value from a byte range and total size.
 *
 * @param range - The byte range.
 * @param size - The total size in bytes.
 * @returns The formatted Content-Range header value (e.g. `"bytes 0-499/1234"`).
 */
export function formatContentRange(range: ByteRange, size: number): string {
  const resolved = resolveRange(range, size);

  if (!resolved) {
    return "bytes */" + String(size);
  }

  return `bytes ${resolved.start}-${resolved.end}/${size}`;
}
