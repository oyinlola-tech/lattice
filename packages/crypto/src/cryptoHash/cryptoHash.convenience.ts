import type { HashInput, HashEncoding } from "./cryptoHash.core.js";

import { hash } from "./cryptoHash.core.js";

/**
 * Calculates a SHA-256 digest.
 */
export async function sha256(
  input: HashInput,
  encoding: HashEncoding = "hex",
): Promise<string> {
  return (
    await hash(input, {
      algorithm: "sha256",
      encoding,
    })
  ).encoded;
}

/**
 * Calculates a SHA-384 digest.
 */
export async function sha384(
  input: HashInput,
  encoding: HashEncoding = "hex",
): Promise<string> {
  return (
    await hash(input, {
      algorithm: "sha384",
      encoding,
    })
  ).encoded;
}

/**
 * Calculates a SHA-512 digest.
 */
export async function sha512(
  input: HashInput,
  encoding: HashEncoding = "hex",
): Promise<string> {
  return (
    await hash(input, {
      algorithm: "sha512",
      encoding,
    })
  ).encoded;
}

/**
 * Calculates a SHA3-256 digest.
 */
export async function sha3_256(
  input: HashInput,
  encoding: HashEncoding = "hex",
): Promise<string> {
  return (
    await hash(input, {
      algorithm: "sha3-256",
      encoding,
    })
  ).encoded;
}

/**
 * Calculates a SHA3-384 digest.
 */
export async function sha3_384(
  input: HashInput,
  encoding: HashEncoding = "hex",
): Promise<string> {
  return (
    await hash(input, {
      algorithm: "sha3-384",
      encoding,
    })
  ).encoded;
}

/**
 * Calculates a SHA3-512 digest.
 */
export async function sha3_512(
  input: HashInput,
  encoding: HashEncoding = "hex",
): Promise<string> {
  return (
    await hash(input, {
      algorithm: "sha3-512",
      encoding,
    })
  ).encoded;
}
