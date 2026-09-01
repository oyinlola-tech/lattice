/**
 * Converts bytes into Base64.
 */
export function bytesToBase64(value: Uint8Array): string {
  const binary = Array.from(value)
    .map((b) => String.fromCharCode(b))
    .join("");

  return btoa(binary);
}

/**
 * Converts Base64 into bytes.
 */
export function base64ToBytes(value: string): Uint8Array {
  if (typeof value !== "string") {
    throw new TypeError("Base64 value must be a string.");
  }

  if (
    value.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      value,
    )
  ) {
    throw new TypeError("Invalid Base64 value.");
  }

  const binary = atob(value);

  const result = new Uint8Array(binary.length);

  for (let i = 0; i < binary.length; i += 1) {
    result[i] = binary.charCodeAt(i);
  }

  return result;
}
