/**
 * Content-Range header parsing utilities.
 *
 * @module httpHeaders/contentRangeParse
 */

import type { ContentRange } from "../types/httpHeaders.type.js";

/**
 * Parses a Content-Range header value.
 *
 * @param value - The raw Content-Range header value.
 * @returns The parsed content range, or `undefined` if invalid.
 */
export function parseContentRange(
  value: string | undefined,
): ContentRange | undefined {
  if (!value) {
    return undefined;
  }

  const separator = value.indexOf(" ");

  if (separator === -1) {
    return undefined;
  }

  const unit = value.slice(0, separator).trim();

  const range = value.slice(separator + 1).trim();

  const slash = range.indexOf("/");

  if (slash === -1) {
    return undefined;
  }

  const rangePart = range.slice(0, slash);

  const totalPart = range.slice(slash + 1).trim();

  const dash = rangePart.indexOf("-");

  if (dash === -1) {
    return undefined;
  }

  const start = Number(rangePart.slice(0, dash));

  const end = Number(rangePart.slice(dash + 1));

  const total = totalPart === "*" ? undefined : Number(totalPart);

  if (
    !Number.isSafeInteger(start) ||
    !Number.isSafeInteger(end) ||
    start < 0 ||
    end < start
  ) {
    return undefined;
  }

  if (total !== undefined && (!Number.isSafeInteger(total) || total < 0)) {
    return undefined;
  }

  return {
    unit,
    start,
    end,
    total,
  };
}
