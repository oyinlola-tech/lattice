import type { EncryptionAlgorithm } from "../cryptoProvider.type.js";

/**
 * Result of an encryption operation.
 */
export interface EncryptedData {
  readonly algorithm: EncryptionAlgorithm;
  readonly ciphertext: Uint8Array;
  readonly nonce: Uint8Array;
  readonly tag: Uint8Array;
}

/**
 * Options for encryption.
 */
export interface EncryptOptions {
  readonly key: Uint8Array;
  readonly plaintext: Uint8Array;
  readonly associatedData?: Uint8Array;
  readonly nonce?: Uint8Array;
}

/**
 * Options for decryption.
 */
export interface DecryptOptions {
  readonly key: Uint8Array;
  readonly encrypted: EncryptedData;
  readonly associatedData?: Uint8Array;
}
