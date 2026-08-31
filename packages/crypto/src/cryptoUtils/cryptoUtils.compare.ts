import {
  timingSafeEqual,
} from "../compare/compare.helper.js";

/**
 * Compares two byte arrays in constant time.
 *
 * Different lengths return false immediately.
 */
export function secureEqual(
  left: Uint8Array,
  right: Uint8Array,
): boolean {
  if (
    left.byteLength !==
    right.byteLength
  ) {
    return false;
  }

  return timingSafeEqual(
    left,
    right,
  );
}

/**
 * Performs a constant-time comparison of two strings.
 */
export function secureStringEqual(
  left: string,
  right: string,
): boolean {
  if (
    typeof left !== "string" ||
    typeof right !== "string"
  ) {
    return false;
  }

  const leftBytes =
    new TextEncoder()
      .encode(left);

  const rightBytes =
    new TextEncoder()
      .encode(right);

  if (
    leftBytes.byteLength !==
    rightBytes.byteLength
  ) {
    return false;
  }

  return timingSafeEqual(
    leftBytes,
    rightBytes,
  );
}
