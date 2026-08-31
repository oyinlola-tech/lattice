import type { CryptoAlgorithm } from "../cryptoConstants/cryptoConstants.type.js";

/**
 * Supported hash algorithm identifiers.
 */
export type HashAlgorithm =
  | "sha256"
  | "sha384"
  | "sha512"
  | "sha3-256"
  | "sha3-384"
  | "sha3-512";

/**
 * Supported HMAC algorithm identifiers.
 */
export type HmacAlgorithm =
  | "sha256"
  | "sha384"
  | "sha512";

/**
 * Supported encryption algorithm identifiers.
 */
export type EncryptionAlgorithm =
  | "aes-256-gcm"
  | "chacha20-poly1305";

/**
 * Supported signature algorithm identifiers.
 */
export type SignatureAlgorithm =
  | "ed25519"
  | "rsa-sha256"
  | "rsa-sha384"
  | "rsa-sha512"
  | "ecdsa-sha256"
  | "ecdsa-sha384"
  | "ecdsa-sha512";

/**
 * Supported key derivation algorithm identifiers.
 */
export type KeyDerivationAlgorithm =
  | "pbkdf2"
  | "scrypt"
  | "argon2id";

/**
 * Supported encoding formats.
 */
export type EncodingFormat =
  | "hex"
  | "base64"
  | "base64url"
  | "utf8";

/**
 * Normalized cryptographic input.
 */
export type CryptoInput =
  | string
  | Uint8Array
  | ArrayBuffer;

/**
 * Capabilities of a crypto provider.
 */
export interface CryptoCapabilities {
  readonly hash: boolean;
  readonly hmac: boolean;
  readonly encryption: boolean;
  readonly signing: boolean;
  readonly random: boolean;
  readonly passwordHashing: boolean;
  readonly keyDerivation: boolean;
}
