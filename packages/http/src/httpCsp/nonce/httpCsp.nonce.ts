/**
 * CSP nonce and hash source generation.
 */

import type { CSPNonceOptions } from "../types/httpCsp.type.js";
import { DEFAULT_NONCE_LENGTH } from "../types/httpCsp.constant.js";

function getCrypto(): Crypto | undefined {
  if (typeof globalThis !== "undefined" && "crypto" in globalThis) {
    return globalThis.crypto;
  }
  return undefined;
}

function fillRandomBytes(bytes: Uint8Array): void {
  const cryptoObject = getCrypto();

  if (cryptoObject?.getRandomValues) {
    cryptoObject.getRandomValues(bytes as any);
    return;
  }

  throw new Error(
    "A cryptographically secure random number generator is required to create a CSP nonce.",
  );
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  if (typeof btoa === "function") {
    return btoa(binary);
  }

  throw new Error("Base64 encoding is not available in this runtime.");
}

function toBase64Url(bytes: Uint8Array): string {
  return toBase64(bytes)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

export function isValidNonce(nonce: string): boolean {
  return nonce.length > 0 && /^[A-Za-z0-9+/_=-]+$/.test(nonce);
}

function validateNonce(nonce: string): void {
  if (!isValidNonce(nonce)) {
    throw new TypeError("Invalid CSP nonce.");
  }
}

export function generateCSPNonce(
  options: CSPNonceOptions | undefined = {},
): string {
  const length = options.length ?? DEFAULT_NONCE_LENGTH;

  if (!Number.isSafeInteger(length) || length <= 0) {
    throw new RangeError("CSP nonce length must be a positive safe integer.");
  }

  const bytes = new Uint8Array(length);
  fillRandomBytes(bytes);

  const encoding = options.encoding ?? "base64url";

  if (encoding === "base64url") {
    return toBase64Url(bytes);
  }

  return toBase64(bytes);
}

export function createNonceSource(nonce: string): string {
  validateNonce(nonce);
  return `'nonce-${nonce}'`;
}

export function createHashSource(
  algorithm: "sha256" | "sha384" | "sha512",
  base64Hash: string,
): string {
  if (!base64Hash) {
    throw new TypeError("CSP hash cannot be empty.");
  }
  return `'${algorithm}-${base64Hash}'`;
}
