/**
 * ETag comparison and list parsing utilities.
 *
 * @module httpHeaders/etagMatch
 */

import { splitHeaderValues } from "../list/httpHeaders.list.js";
import { normalizeETag, stripWeakETag } from "./httpHeaders.etag.js";

/**
 * Compares two ETags for equality.
 *
 * @param actual - The actual ETag.
 * @param expected - The expected ETag.
 * @param weak - If `true` (default), compares strong forms only (strips `W/` prefix).
 * @returns `true` if the ETags match.
 */
export function etagMatches(
  actual: string | undefined,
  expected: string | undefined,
  weak: boolean = true,
): boolean {
  const left = normalizeETag(actual);

  const right = normalizeETag(expected);

  if (!left || !right) {
    return false;
  }

  if (left === "*" || right === "*") {
    return true;
  }

  if (weak) {
    return stripWeakETag(left) === stripWeakETag(right);
  }

  return left === right;
}

/**
 * Parses a comma-separated list of ETags.
 *
 * @param value - The raw ETag list string.
 * @returns An array of trimmed ETag values.
 */
export function parseETagList(value: string | undefined): string[] {
  if (!value) {
    return [];
  }

  return splitHeaderValues(value).map((item) => item.trim());
}
