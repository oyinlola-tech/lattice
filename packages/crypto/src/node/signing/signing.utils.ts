import type { SignatureAlgorithm } from "../../cryptoProvider/index.js";
import type { KeyObject } from "node:crypto";

/**
 * Maps a signature algorithm to a Node.js hash algorithm name.
 */
export function nodeSignatureAlgorithm(algorithm: SignatureAlgorithm): string {
  switch (algorithm) {
    case "rsa-sha256":
      return "RSA-SHA256";
    case "rsa-sha384":
      return "RSA-SHA384";
    case "rsa-sha512":
      return "RSA-SHA512";
    case "ecdsa-sha256":
      return "SHA256";
    case "ecdsa-sha384":
      return "SHA384";
    case "ecdsa-sha512":
      return "SHA512";
    case "ed25519":
      throw new TypeError("Ed25519 does not use a digest algorithm.");
    default:
      throw new TypeError(
        `Unsupported signature algorithm: ${String(algorithm)}.`,
      );
  }
}

/**
 * Checks whether a value is a Node.js KeyObject.
 */
export function isKeyObject(value: unknown): value is KeyObject {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "export" in value
  );
}

/**
 * Asserts that a value is a Node.js KeyObject.
 */
export function assertKeyObject(key: KeyObject): void {
  if (!isKeyObject(key)) {
    throw new TypeError("Expected a Node.js KeyObject.");
  }
}
