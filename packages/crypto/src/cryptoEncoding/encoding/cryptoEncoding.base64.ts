/**
 * Encodes bytes as standard Base64.
 */
export function toBase64(
  value: Uint8Array,
): string {
  const binary = Array.from(value)
    .map(b => String.fromCharCode(b))
    .join("");

  return btoa(binary);
}

/**
 * Decodes standard Base64 into bytes.
 */
export function fromBase64(
  value: string,
): Uint8Array {
  if (
    !isBase64(value)
  ) {
    throw new TypeError(
      "Invalid Base64 value.",
    );
  }

  const binary =
    atob(value);

  const result =
    new Uint8Array(
      binary.length,
    );

  for (
    let i = 0;
    i < binary.length;
    i += 1
  ) {
    result[i] =
      binary.charCodeAt(i);
  }

  return result;
}

/**
 * Returns whether a string is valid standard Base64.
 */
export function isBase64(
  value: string,
): boolean {
  if (
    typeof value !== "string" ||
    value.length === 0 ||
    value.length % 4 !== 0
  ) {
    return false;
  }

  return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
    value,
  );
}
