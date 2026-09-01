import { toBase64 } from "./cryptoEncoding.base64.js";

import { fromBase64 } from "./cryptoEncoding.base64.js";

/**
 * Encodes bytes as URL-safe Base64 without padding.
 */
export function toBase64Url(value: Uint8Array): string {
  return toBase64(value)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Decodes URL-safe Base64 into bytes.
 */
export function fromBase64Url(value: string): Uint8Array {
  if (value.length === 0) {
    return new Uint8Array();
  }

  if (!isBase64Url(value)) {
    throw new TypeError("Invalid Base64URL value.");
  }

  if (value.length % 4 === 1) {
    throw new TypeError("Invalid Base64URL length.");
  }

  let base64 = value.replace(/-/g, "+").replace(/_/g, "/");

  while (base64.length % 4) {
    base64 += "=";
  }

  return fromBase64(base64);
}

/**
 * Returns whether a string is valid URL-safe Base64.
 */
export function isBase64Url(value: string): boolean {
  if (typeof value !== "string" || value.length === 0) {
    return false;
  }

  return /^(?:[A-Za-z0-9_-]{2,4})*(?:[A-Za-z0-9_-]{2,3})?$/.test(value);
}
