import type { HashEncoding } from "./cryptoHash.core.js";

/**
 * Converts a hash result into its encoded representation.
 */
export function encodeDigest(
  digest: Uint8Array,
  encoding: HashEncoding,
): string {
  const buffer = Buffer.from(digest);

  switch (encoding) {
    case "hex":
      return buffer.toString("hex");
    case "base64":
      return buffer.toString("base64");
    case "base64url":
      return buffer.toString("base64url");
    default:
      throw new TypeError(`Unsupported hash encoding: ${String(encoding)}.`);
  }
}

/**
 * Decodes a hash string into bytes.
 */
export function decodeDigest(
  digest: string,
  encoding: HashEncoding = "hex",
): Uint8Array {
  if (typeof digest !== "string" || digest.length === 0) {
    throw new TypeError("Digest must be a non-empty string.");
  }

  switch (encoding) {
    case "hex": {
      if (!/^[0-9a-fA-F]+$/.test(digest) || digest.length % 2 !== 0) {
        throw new TypeError("Invalid hexadecimal digest.");
      }

      return new Uint8Array(Buffer.from(digest, "hex"));
    }

    case "base64":
      return new Uint8Array(Buffer.from(digest, "base64"));

    case "base64url":
      return new Uint8Array(Buffer.from(digest, "base64url"));

    default:
      throw new TypeError(`Unsupported hash encoding: ${String(encoding)}.`);
  }
}
