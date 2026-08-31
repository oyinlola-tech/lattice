import { createNodeCryptoProvider } from "../node/index.js";

import { encode } from "../cryptoEncoding/cryptoEncoding.core.js";

import type { CryptoProvider } from "../cryptoProvider/index.js";

import type {
  CryptoKey,
  CryptoKeyOptions,
} from "./cryptoKey.type.js";

let defaultProvider: CryptoProvider | undefined;

/**
 * Returns a lazily created default crypto provider.
 *
 * The provider abstraction keeps the key module free of direct
 * `node:crypto` usage while still allowing callers to inject their own.
 */
function getDefaultProvider(): CryptoProvider {
  if (defaultProvider === undefined) {
    defaultProvider =
      createNodeCryptoProvider();
  }

  return defaultProvider;
}

/**
 * Creates a cryptographic key from raw bytes.
 *
 * Hashing and key-id generation are delegated to the supplied provider.
 */
export async function createCryptoKey(
  bytes: Uint8Array,
  options: CryptoKeyOptions,
  provider: CryptoProvider = getDefaultProvider(),
): Promise<CryptoKey> {
  if (
    bytes.byteLength === 0
  ) {
    throw new TypeError(
      "Cryptographic key cannot be empty.",
    );
  }

  const keyBytes =
    new Uint8Array(bytes);

  const digest =
    await provider.hash("sha256", keyBytes);

  const fingerprint =
    encode(digest, "hex");

  const createdAt =
    Date.now();

  const keyId =
    options.keyId ??
    `key_${await generateKeyId(provider)}`;

  const usages = Object.freeze([
    ...(options.usages ?? []),
  ]);

  return Object.freeze({
    algorithm:
      options.algorithm,
    keyId,
    usages,
    extractable:
      options.extractable ??
      false,
    createdAt,
    length:
      keyBytes.byteLength * 8,
    fingerprint,
    bytes: () =>
      new Uint8Array(
        keyBytes,
      ),
  });
}

/**
 * Generates a cryptographically secure random key.
 *
 * Randomness is delegated to the supplied provider.
 */
export async function generateCryptoKey(
  length: number,
  options: CryptoKeyOptions,
  provider: CryptoProvider = getDefaultProvider(),
): Promise<CryptoKey> {
  if (
    !Number.isInteger(length) ||
    length <= 0
  ) {
    throw new RangeError(
      "Cryptographic key length must be a positive integer.",
    );
  }

  const bytes =
    await provider.randomBytes(length);

  return createCryptoKey(
    bytes,
    options,
    provider,
  );
}

/**
 * Returns a defensive copy of a key's bytes.
 *
 * This operation is only permitted for extractable keys.
 */
export function exportCryptoKey(
  key: CryptoKey,
): Uint8Array {
  if (
    !key.extractable
  ) {
    throw new Error(
      `Cryptographic key "${key.keyId}" is not extractable.`,
    );
  }

  return key.bytes();
}

/**
 * Generates a hex-encoded random identifier for a key.
 */
async function generateKeyId(
  provider: CryptoProvider,
): Promise<string> {
  const idBytes =
    await provider.randomBytes(16);

  return encode(idBytes, "hex");
}
