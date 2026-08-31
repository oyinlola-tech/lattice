/**
 * Performs a constant-time comparison of two byte arrays.
 *
 * Returns false immediately if the lengths differ.
 * Uses XOR accumulation to avoid timing side-channels.
 */
export function timingSafeEqual(
  left: Uint8Array,
  right: Uint8Array,
): boolean {
  if (left.byteLength !== right.byteLength) {
    return false;
  }

  let difference = 0;

  for (let index = 0; index < left.byteLength; index += 1) {
    difference |= left[index]! ^ right[index]!;
  }

  return difference === 0;
}
