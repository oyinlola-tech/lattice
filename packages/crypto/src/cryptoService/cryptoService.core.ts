import {
  createHash,
  randomBytes,
} from "node:crypto";

import type {
  CryptoKey,
} from "../cryptoKey/cryptoKey.type.js";

import {
  generateCryptoKey,
} from "../cryptoKey/cryptoKey.type.js";

import {
  encrypt,
  decrypt,
  type CipherOptions,
  type CipherResult,
} from "../cryptoCipher/cryptoCipher.core.js";

import {
  hashPassword,
  verifyPassword,
  type PasswordHashOptions,
  type PasswordHashResult,
} from "../cryptoPassword/cryptoPassword.core.js";

import {
  deriveKey,
  type DerivedKeyResult,
  type Pbkdf2Options,
  type ScryptOptions,
} from "../cryptoKeyDerivation/cryptoKeyDerivation.core.js";

import {
  generateToken,
  generateOtp,
  hashToken,
  verifyTokenHash,
  type TokenOptions,
} from "../cryptoToken/cryptoToken.core.js";

import {
  encode,
  decode,
  type CryptoEncoding,
} from "../cryptoEncoding/cryptoEncoding.core.js";

import {
  CryptoAlgorithm,
} from "../cryptoAlgorithm/cryptoAlgorithm.type.js";

import {
  CryptoError,
  CryptoErrorCode,
  toCryptoError,
} from "../cryptoErrors/cryptoError.base.js";

/**
 * High-level service facade for cryptographic operations.
 *
 * This class provides one stable API over the lower-level crypto
 * primitives in this package.
 */
export class CryptoService {
  /**
   * Generates a cryptographic key.
   */
  public generateKey(
    algorithm: CryptoAlgorithm = CryptoAlgorithm.AES_256_GCM,
  ): CryptoKey {
    try {
      const length =
        algorithm.includes("256") ? 32 :
        algorithm.includes("384") ? 48 :
        algorithm.includes("512") ? 64 : 32;

      return generateCryptoKey(length, {
        algorithm,
        extractable: true,
      });
    } catch (error) {
      throw toCryptoError(
        error,
        "Failed to generate cryptographic key.",
        CryptoErrorCode.KEY_GENERATION_FAILED,
      );
    }
  }

  /**
   * Generates random bytes.
   */
  public randomBytes(
    length = 32,
  ): Uint8Array {
    if (
      !Number.isInteger(length) ||
      length <= 0
    ) {
      throw new CryptoError(
        "Random byte length must be a positive integer.",
        CryptoErrorCode.INVALID_INPUT,
      );
    }

    try {
      return new Uint8Array(
        randomBytes(length),
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "Failed to generate random bytes.",
        CryptoErrorCode.INTERNAL_ERROR,
      );
    }
  }

  /**
   * Encrypts data using the supplied key.
   */
  public encrypt(
    plaintext: Uint8Array,
    key: CryptoKey,
    options?: CipherOptions,
  ): CipherResult {
    try {
      return encrypt(
        plaintext,
        key,
        options,
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "Encryption failed.",
        CryptoErrorCode.ENCRYPTION_FAILED,
      );
    }
  }

  /**
   * Decrypts data using the supplied key.
   */
  public decrypt(
    ciphertext: Uint8Array,
    key: CryptoKey,
    iv: Uint8Array,
    authTag: Uint8Array,
    aad?: Uint8Array,
  ): Uint8Array {
    try {
      return decrypt(
        ciphertext,
        key,
        iv,
        authTag,
        aad,
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "Decryption failed.",
        CryptoErrorCode.DECRYPTION_FAILED,
      );
    }
  }

  /**
   * Hashes arbitrary data with SHA-256.
   */
  public hash(
    value: string | Uint8Array,
  ): Uint8Array {
    try {
      const input =
        typeof value === "string"
          ? Buffer.from(
              value,
              "utf8",
            )
          : Buffer.from(value);

      return new Uint8Array(
        createHash(
          "sha256",
        )
          .update(input)
          .digest(),
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "Hashing failed.",
        CryptoErrorCode.HASH_FAILED,
      );
    }
  }

  /**
   * Hashes arbitrary data and returns hexadecimal output.
   */
  public hashHex(
    value: string | Uint8Array,
  ): string {
    return encode(
      this.hash(value),
      "hex",
    );
  }

  /**
   * Hashes a password using scrypt.
   */
  public async hashPassword(
    password: string,
    options?: PasswordHashOptions,
  ): Promise<PasswordHashResult> {
    try {
      return await hashPassword(
        password,
        options,
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "Password hashing failed.",
        CryptoErrorCode.PASSWORD_HASH_FAILED,
      );
    }
  }

  /**
   * Verifies a password against a stored password hash.
   */
  public async verifyPassword(
    password: string,
    encodedHash: string,
  ): Promise<boolean> {
    try {
      return await verifyPassword(
        password,
        encodedHash,
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "Password verification failed.",
        CryptoErrorCode.PASSWORD_VERIFICATION_FAILED,
      );
    }
  }

  /**
   * Derives a cryptographic key from password material.
   */
  public async deriveKey(
    password: string | Uint8Array,
    algorithm: CryptoAlgorithm,
    options?:
      | Pbkdf2Options
      | ScryptOptions,
  ): Promise<DerivedKeyResult> {
    try {
      return await deriveKey(
        password,
        algorithm,
        options,
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "Key derivation failed.",
        CryptoErrorCode.KEY_DERIVATION_FAILED,
      );
    }
  }

  /**
   * Generates a cryptographically secure opaque token.
   */
  public generateToken(
    options?: TokenOptions,
  ): string {
    try {
      return generateToken(
        options,
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "Token generation failed.",
        CryptoErrorCode.TOKEN_GENERATION_FAILED,
      );
    }
  }

  /**
   * Generates a secure one-time password.
   */
  public generateOtp(
    digits = 6,
  ): string {
    try {
      return generateOtp(
        digits,
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "OTP generation failed.",
        CryptoErrorCode.TOKEN_GENERATION_FAILED,
      );
    }
  }

  /**
   * Hashes an opaque token before database storage.
   */
  public hashToken(
    token: string,
  ): string {
    try {
      return hashToken(
        token,
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "Token hashing failed.",
        CryptoErrorCode.HASH_FAILED,
      );
    }
  }

  /**
   * Verifies an opaque token against its stored hash.
   */
  public verifyToken(
    token: string,
    expectedHash: string,
  ): boolean {
    try {
      return verifyTokenHash(
        token,
        expectedHash,
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "Token verification failed.",
        CryptoErrorCode.VERIFICATION_FAILED,
      );
    }
  }

  /**
   * Encodes binary data.
   */
  public encode(
    value: Uint8Array,
    encoding: CryptoEncoding = "base64url",
  ): string {
    try {
      return encode(
        value,
        encoding,
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "Crypto encoding failed.",
        CryptoErrorCode.INVALID_ENCODING,
      );
    }
  }

  /**
   * Decodes encoded binary data.
   */
  public decode(
    value: string,
    encoding: CryptoEncoding = "base64url",
  ): Uint8Array {
    try {
      return decode(
        value,
        encoding,
      );
    } catch (error) {
      throw toCryptoError(
        error,
        "Crypto decoding failed.",
        CryptoErrorCode.INVALID_ENCODING,
      );
    }
  }
}

/**
 * Creates a new CryptoService instance.
 */
export function createCryptoService(): CryptoService {
  return new CryptoService();
}

/**
 * Default crypto service instance.
 */
export const cryptoService =
  createCryptoService();