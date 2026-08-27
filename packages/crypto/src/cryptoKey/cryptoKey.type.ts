import {
  createHash,
  randomBytes,
} from "node:crypto";

import type {
  CryptoAlgorithm,
} from "../cryptoAlgorithm/cryptoAlgorithm.type.js";

/**
 * Supported cryptographic key usages.
 */
export enum CryptoKeyUsage {
  ENCRYPT = "encrypt",
  DECRYPT = "decrypt",
  SIGN = "sign",
  VERIFY = "verify",
  DERIVE_KEY = "derive-key",
  DERIVE_BITS = "derive-bits",
  WRAP_KEY = "wrap-key",
  UNWRAP_KEY = "unwrap-key",
}

/**
 * A cryptographic key represented as immutable bytes.
 *
 * The underlying byte array is copied when a key is created and when
 * its bytes are requested to prevent accidental mutation.
 */
export interface CryptoKey {
  readonly algorithm: CryptoAlgorithm;
  readonly keyId: string;
  readonly usages: readonly CryptoKeyUsage[];
  readonly extractable: boolean;
  readonly createdAt: number;
  readonly length: number;
  readonly fingerprint: string;
  readonly bytes: () => Uint8Array;
}

/**
 * Options used to create a cryptographic key.
 */
export interface CryptoKeyOptions {
  readonly algorithm: CryptoAlgorithm;
  readonly keyId?: string;
  readonly usages?: readonly CryptoKeyUsage[];
  readonly extractable?: boolean;
}

/**
 * Creates a cryptographic key from raw bytes.
 */
export function createCryptoKey(
  bytes: Uint8Array,
  options: CryptoKeyOptions,
): CryptoKey {
  if (
    bytes.byteLength === 0
  ) {
    throw new TypeError(
      "Cryptographic key cannot be empty.",
    );
  }

  const keyBytes =
    new Uint8Array(bytes);

  const fingerprint =
    createHash("sha256")
      .update(keyBytes)
      .digest("hex");

  const createdAt =
    Date.now();

  const keyId =
    options.keyId ??
    `key_${randomBytes(16).toString("hex")}`;

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
 */
export function generateCryptoKey(
  length: number,
  options: CryptoKeyOptions,
): CryptoKey {
  if (
    !Number.isInteger(length) ||
    length <= 0
  ) {
    throw new RangeError(
      "Cryptographic key length must be a positive integer.",
    );
  }

  return createCryptoKey(
    randomBytes(length),
    options,
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
 * Returns a stable SHA-256 fingerprint for a key.
 *
 * The fingerprint can be used for identification without exposing
 * the secret key material.
 */
export function getCryptoKeyFingerprint(
  key: CryptoKey,
): string {
  return key.fingerprint;
}

/**
 * Compares two cryptographic keys by identity.
 */
export function cryptoKeysEqual(
  left: CryptoKey,
  right: CryptoKey,
): boolean {
  return (
    left.keyId ===
      right.keyId &&
    left.fingerprint ===
      right.fingerprint &&
    left.algorithm ===
      right.algorithm
  );
}

/**
 * Checks whether a value is a CryptoKey.
 */
export function isCryptoKey(
  value: unknown,
): value is CryptoKey {
  if (
    typeof value !==
      "object" ||
    value === null
  ) {
    return false;
  }

  const key =
    value as Partial<CryptoKey>;

  return (
    typeof key.algorithm ===
      "string" &&
    typeof key.keyId ===
      "string" &&
    Array.isArray(
      key.usages,
    ) &&
    typeof key.extractable ===
      "boolean" &&
    typeof key.createdAt ===
      "number" &&
    typeof key.length ===
      "number" &&
    typeof key.fingerprint ===
      "string" &&
    typeof key.bytes ===
      "function"
  );
}