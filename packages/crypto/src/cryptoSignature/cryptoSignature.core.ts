import {
  createNodeCryptoProvider,
} from "../node/index.js";

import type {
  CryptoInput,
} from "../cryptoProvider/index.js";

import type { SignatureAlgorithm } from "../cryptoProvider/index.js";

/**
 * Supported signature algorithms.
 */
export type SignatureOptions = {
  readonly algorithm?: SignatureAlgorithm;
};

const provider = createNodeCryptoProvider();

/**
 * Signs arbitrary data using a private key.
 */
export async function sign(
  data: Uint8Array,
  privateKey: CryptoInput,
  options: SignatureOptions = {},
): Promise<Uint8Array> {
  return provider.sign({
    key: privateKey,
    data,
    algorithm: options.algorithm ?? "ed25519",
  });
}

/**
 * Verifies a signature using a public key.
 */
export async function verify(
  data: Uint8Array,
  signature: Uint8Array,
  publicKey: CryptoInput,
  options: SignatureOptions = {},
): Promise<boolean> {
  return provider.verify({
    key: publicKey,
    data,
    signature,
    algorithm: options.algorithm ?? "ed25519",
  });
}

/**
 * Signs UTF-8 text.
 */
export async function signString(
  data: string,
  privateKey: CryptoInput,
  options: SignatureOptions = {},
): Promise<Uint8Array> {
  return sign(
    Buffer.from(data, "utf8"),
    privateKey,
    options,
  );
}

/**
 * Verifies a signature against UTF-8 text.
 */
export async function verifyString(
  data: string,
  signature: Uint8Array,
  publicKey: CryptoInput,
  options: SignatureOptions = {},
): Promise<boolean> {
  return verify(
    Buffer.from(data, "utf8"),
    signature,
    publicKey,
    options,
  );
}
