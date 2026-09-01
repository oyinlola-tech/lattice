/**
 * Returns whether a value is a Uint8Array.
 */
export function isBytes(value: unknown): value is Uint8Array {
  return value instanceof Uint8Array;
}

/**
 * Returns whether a value is an ArrayBuffer.
 */
export function isArrayBuffer(value: unknown): value is ArrayBuffer {
  return value instanceof ArrayBuffer;
}

/**
 * Returns whether a string contains only hexadecimal characters.
 */
export function isHexString(value: string): boolean {
  return (
    typeof value === "string" &&
    value.length % 2 === 0 &&
    /^[0-9a-fA-F]*$/.test(value)
  );
}

/**
 * Returns whether a string is a valid Base64URL value.
 */
export function isBase64UrlString(value: string): boolean {
  return (
    typeof value === "string" &&
    value.length % 4 !== 1 &&
    /^[A-Za-z0-9_-]*$/.test(value)
  );
}
