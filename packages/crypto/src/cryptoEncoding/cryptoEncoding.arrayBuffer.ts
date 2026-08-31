/**
 * Converts an ArrayBuffer into a defensive Uint8Array copy.
 */
export function arrayBufferToBytes(
  value: ArrayBuffer,
): Uint8Array {
  if (
    !(value instanceof ArrayBuffer)
  ) {
    throw new TypeError(
      "Value must be an ArrayBuffer.",
    );
  }

  return new Uint8Array(
    value.slice(0),
  );
}

/**
 * Converts bytes into an ArrayBuffer copy.
 */
export function bytesToArrayBuffer(
  value: Uint8Array,
): ArrayBuffer {
  if (
    !(value instanceof Uint8Array)
  ) {
    throw new TypeError(
      "Value must be a Uint8Array.",
    );
  }

  return value.buffer.slice(
    value.byteOffset,
    value.byteOffset +
      value.byteLength,
  ) as ArrayBuffer;
}
