import type {
  HashAlgorithm,
  HmacAlgorithm,
  EncryptionAlgorithm,
  SignatureAlgorithm,
  KeyDerivationAlgorithm,
  CryptoInput,
  CryptoCapabilities,
} from "./cryptoProvider.type.js";

import type {
  EncryptedData,
  EncryptOptions,
  DecryptOptions,
} from "./types/cryptoCipher.type.js";

import type {
  SignOptions,
  VerifyOptions,
} from "./types/cryptoSignature.type.js";

import type {
  DerivedKeyResult,
  DeriveKeyOptions,
} from "./types/cryptoKeyDerivation.type.js";

/**
 * Provider for cryptographically secure random bytes.
 */
export interface RandomProvider {
  readonly name: string;
  readonly capabilities: CryptoCapabilities;

  randomBytes(length: number): Promise<Uint8Array>;
  randomInt(min: number, max: number): Promise<number>;
  randomUUID(): Promise<string>;
}

/**
 * Provider for cryptographic hashing.
 */
export interface HashProvider {
  readonly name: string;
  readonly capabilities: CryptoCapabilities;

  hash(algorithm: HashAlgorithm, data: CryptoInput): Promise<Uint8Array>;
}

/**
 * Provider for HMAC operations.
 */
export interface HmacProvider {
  readonly name: string;
  readonly capabilities: CryptoCapabilities;

  hmac(
    algorithm: HmacAlgorithm,
    key: CryptoInput,
    data: CryptoInput,
  ): Promise<Uint8Array>;
}

/**
 * Provider for symmetric encryption and decryption.
 */
export interface EncryptionProvider {
  readonly name: string;
  readonly capabilities: CryptoCapabilities;

  encrypt(options: {
    key: CryptoInput;
    plaintext: CryptoInput;
    associatedData?: CryptoInput;
    nonce?: Uint8Array;
  }): Promise<EncryptedData>;

  decrypt(options: {
    key: CryptoInput;
    encrypted: EncryptedData;
    associatedData?: CryptoInput;
  }): Promise<Uint8Array>;
}

/**
 * Provider for digital signing.
 */
export interface SigningProvider {
  readonly name: string;
  readonly capabilities: CryptoCapabilities;

  sign(options: {
    key: CryptoInput;
    data: CryptoInput;
    algorithm?: SignatureAlgorithm;
  }): Promise<Uint8Array>;

  verify(options: {
    key: CryptoInput;
    data: CryptoInput;
    signature: Uint8Array;
    algorithm?: SignatureAlgorithm;
  }): Promise<boolean>;
}

/**
 * Provider for key derivation.
 */
export interface KeyDerivationProvider {
  readonly name: string;
  readonly capabilities: CryptoCapabilities;

  deriveKey(options: DeriveKeyOptions): Promise<Uint8Array>;
}

/**
 * Provider for password hashing.
 */
export interface PasswordProvider {
  readonly name: string;
  readonly capabilities: CryptoCapabilities;

  hashPassword(password: CryptoInput, options?: {
    algorithm?: KeyDerivationAlgorithm;
    memoryCost?: number;
    timeCost?: number;
    blockSize?: number;
    parallelism?: number;
    keyBytes?: number;
    salt?: Uint8Array;
  }): Promise<string>;

  verifyPassword(password: CryptoInput, hash: string): Promise<boolean>;
}
