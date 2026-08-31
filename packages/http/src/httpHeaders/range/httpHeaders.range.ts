/**
 * Range header parsing utilities.
 *
 * @module httpHeaders/range
 */

import type { ByteRange } from "../types/httpHeaders.type.js";
import { parseSingleRange } from "./httpHeaders.rangeSingle.js";

/**
 * Parses a Range header value into an array of byte ranges.
 *
 * @param value - The raw Range header value.
 * @returns An array of parsed byte ranges.
 */
export function parseRange(
  value:
    | string
    | undefined,
): ByteRange[] {
  if (
    !value
  ) {
    return [];
  }

  const trimmed =
    value.trim();

  const separator =
    trimmed.indexOf(
      "=",
    );

  if (
    separator ===
      -1
  ) {
    return [];
  }

  const unit =
    trimmed
      .slice(
        0,
        separator,
      )
      .trim()
      .toLowerCase();

  if (
    unit !==
    "bytes"
  ) {
    return [];
  }

  const rangeSpecs =
    trimmed
      .slice(
        separator + 1,
      )
      .split(",");

  const result:
    ByteRange[] =
    [];

  for (
    const spec of rangeSpecs
  ) {
    const parsed =
      parseSingleRange(
        spec,
      );

    if (
      parsed
    ) {
      result.push(
        parsed,
      );
    }
  }

  return result;
}
