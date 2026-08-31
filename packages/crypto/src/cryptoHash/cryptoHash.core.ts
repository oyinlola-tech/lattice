import {
  createNodeCryptoProvider,
} from "../node/index.js";

import type {
  HashAlgorithm,
  CryptoInput,
} from "../cryptoProvider/index.js";

import type {
  HashResult,
  HashEncoding,
} from "../cryptoProvider/types/cryptoHash.type.js";

export type { HashResult, HashEncoding } from "../cryptoProvider/types/cryptoHash.type.js";

import { encodeDigest } from "./cryptoHash.codec.js";

const provider = createNodeCryptoProvider();

/**
 * Converts supported input data into bytes.
 */
export type HashInput =
  | string
  | Uint8Array
  | ArrayBuffer;

/**
 * Options for hashing data.
 */
export interface HashOptions {
  readonly algorithm?: HashAlgorithm;
  readonly encoding?: HashEncoding;
}

/**
 * Hashes arbitrary data using a cryptographic hash algorithm.
 */
export async function hash(
  input: HashInput,
  options: HashOptions = {},
): Promise<HashResult> {
  const algorithm =
    options.algorithm ??
    "sha256";

  const digest = await provider.hash(algorithm, input);

  const encoding =
    options.encoding ??
    "hex";

  return Object.freeze({
    algorithm,
    digest,
    encoded: encodeDigest(digest, encoding),
  });
}
