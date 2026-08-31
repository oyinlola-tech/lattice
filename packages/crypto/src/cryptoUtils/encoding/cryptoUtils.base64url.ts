/**
 * Converts bytes into URL-safe Base64 without padding.
 */
export function bytesToBase64Url(
  value: Uint8Array,
): string {
  const binary = Array.from(value)
    .map(b => String.fromCharCode(b))
    .join("");

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Converts URL-safe Base64 into bytes.
 */
export function base64UrlToBytes(
  value: string,
): Uint8Array {
  if (
    typeof value !== "string"
  ) {
    throw new TypeError(
      "Base64URL value must be a string.",
    );
  }

  if (
    !/^[A-Za-z0-9_-]*$/.test(
      value,
    )
  ) {
    throw new TypeError(
      "Invalid Base64URL value.",
    );
  }

  if (
    value.length % 4 === 1
  ) {
    throw new TypeError(
      "Invalid Base64URL length.",
    );
  }

  let base64 = value
    .replace(/-/g, "+")
    .replace(/_/g, "/");

  while (
    base64.length % 4
  ) {
    base64 += "=";
  }

  const binary =
    atob(base64);

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
