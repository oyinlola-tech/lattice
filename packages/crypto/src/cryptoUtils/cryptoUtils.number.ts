/**
 * Converts a number into an unsigned big-endian byte array.
 */
export function numberToBytes(
  value: number,
  byteLength = 8,
): Uint8Array {
  if (
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new RangeError(
      "value must be a non-negative safe integer.",
    );
  }

  if (
    !Number.isInteger(byteLength) ||
    byteLength <= 0 ||
    byteLength > 6
  ) {
    throw new RangeError(
      "byteLength must be an integer between 1 and 6.",
    );
  }

  const result =
    new Uint8Array(
      byteLength,
    );

  let remaining =
    value;

  for (
    let index =
      byteLength - 1;
    index >= 0;
    index -= 1
  ) {
    result[index] =
      remaining & 0xff;

    remaining =
      Math.floor(
        remaining / 256,
      );
  }

  if (
    remaining !== 0
  ) {
    throw new RangeError(
      "value does not fit within the requested byte length.",
    );
  }

  return result;
}

/**
 * Converts unsigned big-endian bytes into a number.
 */
export function bytesToNumber(
  value: Uint8Array,
): number {
  if (
    value.byteLength === 0 ||
    value.byteLength > 6
  ) {
    throw new RangeError(
      "Byte array length must be between 1 and 6.",
    );
  }

  let result = 0;

  for (
    const byte of value
  ) {
    result =
      result * 256 +
      byte;
  }

  return result;
}
