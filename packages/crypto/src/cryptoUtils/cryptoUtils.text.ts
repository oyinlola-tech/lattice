/**
 * Normalizes a string before cryptographic processing.
 *
 * This only performs Unicode normalization. It does not trim
 * whitespace because whitespace may be meaningful in passwords
 * and other security-sensitive values.
 */
export function normalizeText(value: string): string {
  if (typeof value !== "string") {
    throw new TypeError("Value must be a string.");
  }

  return value.normalize("NFC");
}

/**
 * Returns the UTF-8 byte length of a string.
 */
export function utf8ByteLength(value: string): number {
  if (typeof value !== "string") {
    throw new TypeError("Value must be a string.");
  }

  return Buffer.byteLength(value, "utf8");
}
