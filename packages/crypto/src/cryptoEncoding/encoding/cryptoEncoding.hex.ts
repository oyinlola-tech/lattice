/**
 * Encodes bytes as hexadecimal.
 */
export function toHex(value: Uint8Array): string {
  return Array.from(value)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/**
 * Decodes hexadecimal into bytes.
 */
export function fromHex(value: string): Uint8Array {
  if (!isHex(value)) {
    throw new TypeError("Invalid hexadecimal value.");
  }

  const result = new Uint8Array(value.length / 2);

  for (let i = 0; i < value.length; i += 2) {
    result[i / 2] = parseInt(value.slice(i, i + 2), 16);
  }

  return result;
}

/**
 * Returns whether a string is valid hexadecimal.
 */
export function isHex(value: string): boolean {
  return (
    typeof value === "string" &&
    value.length > 0 &&
    value.length % 2 === 0 &&
    /^[0-9a-fA-F]*$/.test(value)
  );
}
