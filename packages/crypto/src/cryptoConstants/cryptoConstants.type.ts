import { TimeMs } from "@zudojs/constants";

/**
 * Supported cryptographic algorithms used by Zudojs.
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
export const KEY_DERIVATION_ALGORITHMS = Object.freeze([
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
 * AES-GCM constants.
 */
export const AES_GCM = Object.freeze({
  KEY_BYTES: 32,
  KEY_BITS: 256,
  IV_BYTES: 12,
  AUTH_TAG_BYTES: 16,
} as const);

/**
 * Hash constants.
 */
export const HASH = Object.freeze({
  SHA256_BYTES: 32,
  SHA384_BYTES: 48,
  SHA512_BYTES: 64,

  SHA3_256_BYTES: 32,
  SHA3_384_BYTES: 48,
  SHA3_512_BYTES: 64,
} as const);

/**
 * Key sizes commonly used by the crypto package.
 */
export const KEY_SIZE = Object.freeze({
  AES_128_BITS: 128,
  AES_192_BITS: 192,
  AES_256_BITS: 256,

  ED25519_BITS: 256,

  MIN_SYMMETRIC_KEY_BITS: 128,
} as const);

/**
 * Encoding constants.
 */
export const ENCODING = Object.freeze({
  HEX: "hex",
  BASE64: "base64",
  BASE64URL: "base64url",
  UTF8: "utf8",
} as const);

/**
 * Cryptographic algorithm identifiers.
 */
export const CRYPTO_ALGORITHM = Object.freeze({
  SHA256: "sha256",
  SHA384: "sha384",
  SHA512: "sha512",

  SHA3_256: "sha3-256",
  SHA3_384: "sha3-384",
  SHA3_512: "sha3-512",

  AES_256_GCM: "aes-256-gcm",

  ED25519: "ed25519",

  PBKDF2_SHA256: "pbkdf2-sha256",
  PBKDF2_SHA512: "pbkdf2-sha512",

  SCRYPT: "scrypt",
} as const);
