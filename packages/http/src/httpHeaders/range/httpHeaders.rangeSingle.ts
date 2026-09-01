/**
 * Range header parsing utilities.
 *
 * @module httpHeaders/range
 */

import type { ByteRange } from "../types/httpHeaders.type.js";

/**
 * Parses a single range spec (e.g. `"0-499"` or `"500-"`) into a ByteRange.
 *
 * @param spec - The range spec string.
 * @returns The parsed byte range, or `undefined` if invalid.
 */
export function parseSingleRange(spec: string): ByteRange | undefined {
  const value = spec.trim();

  if (!value) {
    return undefined;
  }

  const dash = value.indexOf("-");

  if (dash === -1) {
    return undefined;
  }

  const startValue = value.slice(0, dash).trim();

  const endValue = value.slice(dash + 1).trim();

  if (startValue === "") {
    const end = Number(endValue);

    if (Number.isSafeInteger(end) && end >= 0) {
      return {
        start: -1,
        end,
      };
    }

    return undefined;
  }

  const start = Number(startValue);

  if (!Number.isSafeInteger(start) || start < 0) {
    return undefined;
  }

  if (endValue === "") {
    return {
      start,
      end: undefined,
    };
  }

  const end = Number(endValue);

  if (!Number.isSafeInteger(end) || end < start) {
    return undefined;
  }

  return {
    start,
    end,
  };
}
