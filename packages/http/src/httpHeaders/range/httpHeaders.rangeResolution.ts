/**
 * Range resolution utilities.
 *
 * @module httpHeaders/rangeResolution
 */

import type { ByteRange } from "../types/httpHeaders.type.js";

/**
 * Resolves a byte range against a total size, clamping to valid bounds.
 *
 * @param range - The byte range to resolve.
 * @param size - The total size in bytes.
 * @returns The resolved range, or `undefined` if the range is unsatisfiable.
 */
export function resolveRange(
  range:
    | ByteRange,
  size:
    | number,
):
  | ByteRange
  | undefined {
  if (
    !Number.isSafeInteger(
      size,
    ) ||
    size <
      0
  ) {
    return undefined;
  }

  if (
    range.start ===
      -1
  ) {
    if (
      range.end ===
        undefined ||
      size ===
        0
    ) {
      return undefined;
    }

    const length =
      Math.min(
        range.end,
        size,
      );

    return {
      start:
        size -
        length,
      end:
        size -
        1,
    };
  }

  if (
    range.start >=
      size
  ) {
    return undefined;
  }

  const end =
    range.end ===
      undefined
      ? size -
        1
      : Math.min(
          range.end,
          size -
            1,
        );

  return {
    start:
      range.start,
    end,
  };
}
