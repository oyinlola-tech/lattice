import type { CryptoKey } from "./cryptoKey.type.js";

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
