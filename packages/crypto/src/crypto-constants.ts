/**
 * Cryptographic package constants.
 *
 * Keep security-sensitive defaults centralized so that consumers
 * do not independently choose incompatible parameters.
 */

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
 * Password hashing constants.
 */
export const PASSWORD_HASH = Object.freeze({
  SALT_BYTES: 16,
  KEY_BYTES: 32,

  SCRYPT: Object.freeze({
    COST: 16_384,
    BLOCK_SIZE: 8,
    PARALLELIZATION: 1,
  }),

  PBKDF2: Object.freeze({
    ITERATIONS: 310_000,
    DIGEST: "sha256",
  }),
} as const);

/**
 * Token constants.
 */
export const TOKEN = Object.freeze({
  DEFAULT_BYTES: 32,

  API_KEY_BYTES: 32,
  SESSION_BYTES: 32,
  REFRESH_BYTES: 48,
  VERIFICATION_BYTES: 32,
  PASSWORD_RESET_BYTES: 32,
  CSRF_BYTES: 32,

  OTP_DIGITS: 6,
  OTP_MIN_DIGITS: 4,
  OTP_MAX_DIGITS: 12,
} as const);

/**
 * Random value constraints.
 */
export const RANDOM = Object.freeze({
  MIN_BYTES: 16,
  DEFAULT_BYTES: 32,
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
 * Password policy defaults.
 *
 * These values are intentionally conservative defaults.
 * Applications may impose stricter requirements.
 */
export const PASSWORD_POLICY = Object.freeze({
  MIN_LENGTH: 8,
  RECOMMENDED_MIN_LENGTH: 12,
  MAX_LENGTH: 1024,
} as const);

/**
 * Password reset and verification token lifetime defaults.
 *
 * Values are expressed in milliseconds.
 */
export const TOKEN_TTL = Object.freeze({
  EMAIL_VERIFICATION_MS:
    15 * 60 * 1000,

  PASSWORD_RESET_MS:
    15 * 60 * 1000,

  LOGIN_VERIFICATION_MS:
    10 * 60 * 1000,

  CSRF_MS:
    60 * 60 * 1000,

  SESSION_MS:
    24 * 60 * 60 * 1000,

  REFRESH_TOKEN_MS:
    30 * 24 * 60 * 60 * 1000,
} as const);

/**
 * Cryptographic protocol versions.
 */
export const CRYPTO_VERSION = Object.freeze({
  CURRENT: "v1",
  PASSWORD_HASH: "v1",
  ENCRYPTION_ENVELOPE: "v1",
  TOKEN: "v1",
} as const);

/**
 * Common token prefixes.
 *
 * Prefixes make opaque credentials easier to identify during
 * logging, debugging, and secret scanning without exposing
 * their underlying value.
 */
export const TOKEN_PREFIX = Object.freeze({
  API_KEY: "lat_",
  SESSION: "sess_",
  REFRESH: "ref_",
  VERIFICATION: "verify_",
  PASSWORD_RESET: "reset_",
  CSRF: "csrf_",
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

/**
 * Type-safe union of supported crypto algorithm identifiers.
 */
export type CryptoAlgorithmName =
  (typeof CRYPTO_ALGORITHM)[keyof typeof CRYPTO_ALGORITHM];

/**
 * Type-safe union of supported token prefixes.
 */
export type TokenPrefix =
  (typeof TOKEN_PREFIX)[keyof typeof TOKEN_PREFIX];

/**
 * Type-safe union of supported encodings.
 */
export type CryptoEncodingName =
  (typeof ENCODING)[keyof typeof ENCODING];

/**
 * Returns the default AES-GCM configuration.
 */
export function getDefaultAesGcmConfig(): {
  readonly keyBytes: number;
  readonly keyBits: number;
  readonly ivBytes: number;
  readonly authTagBytes: number;
} {
  return {
    keyBytes:
      AES_GCM.KEY_BYTES,
    keyBits:
      AES_GCM.KEY_BITS,
    ivBytes:
      AES_GCM.IV_BYTES,
    authTagBytes:
      AES_GCM.AUTH_TAG_BYTES,
  };
}

/**
 * Returns the default password hashing configuration.
 */
export function getDefaultPasswordHashConfig(): {
  readonly saltBytes: number;
  readonly keyBytes: number;
  readonly scryptCost: number;
  readonly scryptBlockSize: number;
  readonly scryptParallelization: number;
  readonly pbkdf2Iterations: number;
  readonly pbkdf2Digest: string;
} {
  return {
    saltBytes:
      PASSWORD_HASH.SALT_BYTES,

    keyBytes:
      PASSWORD_HASH.KEY_BYTES,

    scryptCost:
      PASSWORD_HASH.SCRYPT.COST,

    scryptBlockSize:
      PASSWORD_HASH.SCRYPT.BLOCK_SIZE,

    scryptParallelization:
      PASSWORD_HASH.SCRYPT.PARALLELIZATION,

    pbkdf2Iterations:
      PASSWORD_HASH.PBKDF2.ITERATIONS,

    pbkdf2Digest:
      PASSWORD_HASH.PBKDF2.DIGEST,
  };
}