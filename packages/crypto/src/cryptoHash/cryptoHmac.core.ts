import { createNodeCryptoProvider } from "../node/index.js";

import type { HmacAlgorithm, HashEncoding } from "../cryptoProvider/index.js";

import type { HashInput } from "./cryptoHash.core.js";

import { encodeDigest } from "./cryptoHash.codec.js";

const provider = createNodeCryptoProvider();

/**
 * Calculates a keyed HMAC.
 */
export async function hmac(
  input: HashInput,
  key: Uint8Array,
  algorithm: HmacAlgorithm = "sha256",
  encoding: HashEncoding = "hex",
): Promise<string> {
  const digest = await provider.hmac(algorithm, key, input);

  return encodeDigest(digest, encoding);
}

/**
 * Calculates a SHA-256 HMAC.
 */
export async function hmacSha256(
  input: HashInput,
  key: Uint8Array,
  encoding: HashEncoding = "hex",
): Promise<string> {
  return hmac(input, key, "sha256", encoding);
}

/**
 * Calculates a SHA-384 HMAC.
 */
export async function hmacSha384(
  input: HashInput,
  key: Uint8Array,
  encoding: HashEncoding = "hex",
): Promise<string> {
  return hmac(input, key, "sha384", encoding);
}

/**
 * Calculates a SHA-512 HMAC.
 */
export async function hmacSha512(
  input: HashInput,
  key: Uint8Array,
  encoding: HashEncoding = "hex",
): Promise<string> {
  return hmac(input, key, "sha512", encoding);
}
