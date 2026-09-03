/**
 * @zudo/serialization — Encoding utilities.
 *
 * Base64 and UTF-8 encoding/decoding helpers.
 */

/** Encode a Uint8Array to a Base64 string. */
export function toBase64(data: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(data).toString("base64");
  }
  let binary = "";
  for (let i = 0; i < data.length; i++) {
    binary += String.fromCharCode(data[i]!);
  }
  return btoa(binary);
}

/** Decode a Base64 string into a Uint8Array. */
export function fromBase64(base64: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(base64, "base64"));
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/** Encode a string to a Uint8Array using UTF-8. */
export function encodeUtf8(text: string): Uint8Array {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(text);
  }
  return new Uint8Array(Buffer.from(text, "utf-8"));
}

/** Decode a Uint8Array to a string using UTF-8. */
export function decodeUtf8(data: Uint8Array): string {
  if (typeof TextDecoder !== "undefined") {
    return new TextDecoder("utf-8").decode(data);
  }
  return Buffer.from(data).toString("utf-8");
}
