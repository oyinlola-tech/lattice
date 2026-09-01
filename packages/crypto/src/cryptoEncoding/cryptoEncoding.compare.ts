import { timingSafeEqual } from "../compare/compare.helper.js";

import type { CryptoEncoding } from "./cryptoEncoding.core.js";

import { decode } from "./cryptoEncoding.core.js";

/**
 * Compares two encoded values using constant-time comparison.
 *
 * Both values must use the same encoding.
 */
export function timingSafeEqualEncoded(
  left: string,
  right: string,
  encoding: CryptoEncoding = "base64url",
): boolean {
  const leftBytes = decode(left, encoding);

  const rightBytes = decode(right, encoding);

  if (leftBytes.byteLength !== rightBytes.byteLength) {
    return false;
  }

  return timingSafeEqual(leftBytes, rightBytes);
}
