import { createNodeCryptoProvider } from "../node/index.js";
import { generateCryptoKey } from "../cryptoKey/cryptoKey.factory.js";
import { CryptoAlgorithm } from "../cryptoConstants/cryptoConstants.type.js";
import { createCryptoError } from "@oyinlola141/lattice-errors";
import {
  serviceEncrypt,
  serviceDecrypt,
} from "./operations/cryptoService.cipher.js";
import {
  serviceHash,
  serviceHashHex,
} from "./operations/cryptoService.hash.js";
import {
  serviceHashPassword,
  serviceVerifyPassword,
} from "./operations/cryptoService.password.js";
import { serviceDeriveKey } from "./cryptoService.derivation.js";
import {
  serviceGenerateToken,
  serviceGenerateOtp,
  serviceHashToken,
  serviceVerifyToken,
} from "./operations/cryptoService.token.js";
import { serviceEncode, serviceDecode } from "./cryptoService.encoding.js";
import type { CryptoKey as LatticeCryptoKey } from "../cryptoKey/cryptoKey.type.js";

const provider = createNodeCryptoProvider();

/**
 * High-level service facade for cryptographic operations.
 */
export class CryptoService {
  /** Generates a cryptographic key. */
  async generateKey(
    algorithm: CryptoAlgorithm = CryptoAlgorithm.AES_256_GCM,
  ): Promise<LatticeCryptoKey> {
    const length = algorithm.includes("256")
      ? 32
      : algorithm.includes("384")
        ? 48
        : algorithm.includes("512")
          ? 64
          : 32;
    return generateCryptoKey(length, { algorithm, extractable: true });
  }

  /** Generates random bytes. */
  async randomBytes(length = 32): Promise<Uint8Array> {
    if (!Number.isInteger(length) || length <= 0)
      throw new TypeError("Random byte length must be a positive integer.");
    try {
      return await provider.randomBytes(length);
    } catch {
      throw createCryptoError("Failed to generate random bytes.", {});
    }
  }

  /** Encrypts data using the supplied key. */
  async encrypt(
    plaintext: Uint8Array,
    key: Uint8Array,
    options?: import("./operations/cryptoService.cipher.js").CipherOptions,
  ): Promise<import("./operations/cryptoService.cipher.js").CipherResult> {
    return serviceEncrypt(plaintext, key, options);
  }

  /** Decrypts data using the supplied key. */
  async decrypt(
    ciphertext: Uint8Array,
    key: Uint8Array,
    iv: Uint8Array,
    authTag: Uint8Array,
    aad?: Uint8Array,
  ): Promise<Uint8Array> {
    return serviceDecrypt(ciphertext, key, iv, authTag, aad);
  }

  /** Hashes arbitrary data with SHA-256. */
  async hash(value: string | Uint8Array): Promise<Uint8Array> {
    return serviceHash(value);
  }

  /** Hashes arbitrary data and returns hexadecimal output. */
  async hashHex(value: string | Uint8Array): Promise<string> {
    return serviceHashHex(value);
  }

  /** Hashes a password using the configured algorithm. */
  async hashPassword(
    password: string,
    options?: import("./operations/cryptoService.password.js").PasswordHashOptions,
  ): Promise<
    import("./operations/cryptoService.password.js").PasswordHashResult
  > {
    return serviceHashPassword(password, options);
  }

  /** Verifies a password against a stored password hash. */
  async verifyPassword(
    password: string,
    encodedHash: string,
  ): Promise<boolean> {
    return serviceVerifyPassword(password, encodedHash);
  }

  /** Derives a cryptographic key from password material. */
  async deriveKey(
    password: string | Uint8Array,
    algorithm: CryptoAlgorithm,
    options?:
      | import("./cryptoService.derivation.js").Pbkdf2Options
      | import("./cryptoService.derivation.js").ScryptOptions,
  ): Promise<import("./cryptoService.derivation.js").DerivedKeyResult> {
    return serviceDeriveKey(password, algorithm, options);
  }

  /** Generates a cryptographically secure opaque token. */
  async generateToken(
    options?: import("./operations/cryptoService.token.js").TokenOptions,
  ): Promise<string> {
    return serviceGenerateToken(options);
  }

  /** Generates a secure one-time password. */
  async generateOtp(digits = 6): Promise<string> {
    return serviceGenerateOtp(digits);
  }

  /** Hashes an opaque token before database storage. */
  async hashToken(token: string): Promise<string> {
    return serviceHashToken(token);
  }

  /** Verifies an opaque token against its stored hash. */
  async verifyToken(token: string, expectedHash: string): Promise<boolean> {
    return serviceVerifyToken(token, expectedHash);
  }

  /** Encodes binary data. */
  encode(
    value: Uint8Array,
    encoding: import("./cryptoService.encoding.js").CryptoEncoding = "base64url",
  ): string {
    return serviceEncode(value, encoding);
  }

  /** Decodes encoded binary data. */
  decode(
    value: string,
    encoding: import("./cryptoService.encoding.js").CryptoEncoding = "base64url",
  ): Uint8Array {
    return serviceDecode(value, encoding);
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
export const cryptoService = createCryptoService();
