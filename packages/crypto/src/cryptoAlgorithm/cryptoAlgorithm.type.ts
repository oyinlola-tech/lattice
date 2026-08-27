/**
 * Supported cryptographic algorithms used by Lattice.
 */
export enum CryptoAlgorithm {
  AES_256_GCM = "aes-256-gcm",
  AES_256_CBC = "aes-256-cbc",
  CHACHA20_POLY1305 = "chacha20-poly1305",
  SHA_256 = "sha256",
  SHA_384 = "sha384",
  SHA_512 = "sha512",
  SHA3_256 = "sha3-256",
  SHA3_384 = "sha3-384",
  SHA3_512 = "sha3-512",
  HMAC_SHA256 = "hmac-sha256",
  HMAC_SHA384 = "hmac-sha384",
  HMAC_SHA512 = "hmac-sha512",
  PBKDF2_SHA256 = "pbkdf2-sha256",
  PBKDF2_SHA512 = "pbkdf2-sha512",
  SCRYPT = "scrypt",
  ARGON2ID = "argon2id",
  ED25519 = "ed25519",
  X25519 = "x25519",
}

/**
 * Algorithms that provide authenticated encryption.
 */
export const AEAD_ALGORITHMS = Object.freeze([
  CryptoAlgorithm.AES_256_GCM,
  CryptoAlgorithm.CHACHA20_POLY1305,
] as const);

/**
 * Algorithms intended for hashing.
 */
export const HASH_ALGORITHMS = Object.freeze([
  CryptoAlgorithm.SHA_256,
  CryptoAlgorithm.SHA_384,
  CryptoAlgorithm.SHA_512,
  CryptoAlgorithm.SHA3_256,
  CryptoAlgorithm.SHA3_384,
  CryptoAlgorithm.SHA3_512,
] as const);

/**
 * Algorithms intended for password/key derivation.
 */
export const KEY_DERIVATION_ALGORITHMS =
  Object.freeze([
    CryptoAlgorithm.PBKDF2_SHA256,
    CryptoAlgorithm.PBKDF2_SHA512,
    CryptoAlgorithm.SCRYPT,
    CryptoAlgorithm.ARGON2ID,
  ] as const);

/**
 * Algorithms intended for message authentication.
 */
export const MAC_ALGORITHMS = Object.freeze([
  CryptoAlgorithm.HMAC_SHA256,
  CryptoAlgorithm.HMAC_SHA384,
  CryptoAlgorithm.HMAC_SHA512,
] as const);

/**
 * Returns true when an algorithm provides authenticated encryption.
 */
export function isAeadAlgorithm(
  algorithm: CryptoAlgorithm,
): boolean {
  return AEAD_ALGORITHMS.includes(
    algorithm as (typeof AEAD_ALGORITHMS)[number],
  );
}

/**
 * Returns true when an algorithm is a hashing algorithm.
 */
export function isHashAlgorithm(
  algorithm: CryptoAlgorithm,
): boolean {
  return HASH_ALGORITHMS.includes(
    algorithm as (typeof HASH_ALGORITHMS)[number],
  );
}

/**
 * Returns true when an algorithm is a key derivation algorithm.
 */
export function isKeyDerivationAlgorithm(
  algorithm: CryptoAlgorithm,
): boolean {
  return KEY_DERIVATION_ALGORITHMS.includes(
    algorithm as (typeof KEY_DERIVATION_ALGORITHMS)[number],
  );
}

/**
 * Returns true when an algorithm is a message authentication algorithm.
 */
export function isMacAlgorithm(
  algorithm: CryptoAlgorithm,
): boolean {
  return MAC_ALGORITHMS.includes(
    algorithm as (typeof MAC_ALGORITHMS)[number],
  );
}

/**
 * Returns true when the supplied value is a supported algorithm.
 */
export function isCryptoAlgorithm(
  value: unknown,
): value is CryptoAlgorithm {
  return (
    typeof value === "string" &&
    Object.values(
      CryptoAlgorithm,
    ).includes(
      value as CryptoAlgorithm,
    )
  );
}

/**
 * Parses an algorithm from an arbitrary value.
 *
 * Throws when the value is not a supported algorithm.
 */
export function parseCryptoAlgorithm(
  value: string,
): CryptoAlgorithm {
  const normalized =
    value.trim().toLowerCase();

  if (
    isCryptoAlgorithm(
      normalized,
    )
  ) {
    return normalized;
  }

  throw new TypeError(
    `Unsupported cryptographic algorithm: "${value}".`,
  );
}