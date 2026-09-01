/**
 * Converts bytes into a hexadecimal string.
 */
export function bytesToHex(value: Uint8Array): string {
  return Array.from(value)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Converts a hexadecimal string into bytes.
 */
export function hexToBytes(value: string): Uint8Array {
  if (typeof value !== "string") {
    throw new TypeError("Hex value must be a string.");
  }

  if (value.length % 2 !== 0 || !/^[0-9a-fA-F]*$/.test(value)) {
    throw new TypeError("Invalid hexadecimal value.");
  }

  const result = new Uint8Array(value.length / 2);

  for (let i = 0; i < value.length; i += 2) {
    result[i / 2] = parseInt(value.slice(i, i + 2), 16);
  }

  return result;
}
