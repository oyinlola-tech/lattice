import { createNodeCryptoProvider } from "../node/index.js";

const provider = createNodeCryptoProvider();

/**
 * Options used when encrypting data.
 */
export interface CipherOptions {
  readonly iv?: Uint8Array;
  readonly aad?: Uint8Array;
}

/**
 * Authenticated encryption result.
 */
export interface CipherResult {
  readonly algorithm: string;
  readonly ciphertext: Uint8Array;
  readonly iv: Uint8Array;
  readonly authTag: Uint8Array;
}

/**
 * Encrypts data using AES-256-GCM.
 */
export async function encrypt(
  plaintext: Uint8Array,
  key: Uint8Array,
  options: CipherOptions = {},
): Promise<CipherResult> {
  const encrypted = await provider.encrypt({
    key,
    plaintext,
    associatedData: options.aad,
    nonce: options.iv,
  });

  return Object.freeze({
    algorithm: encrypted.algorithm,
    ciphertext: encrypted.ciphertext,
    iv: encrypted.nonce,
    authTag: encrypted.tag,
  });
}

/**
 * Decrypts AES-256-GCM ciphertext.
 */
export async function decrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
  authTag: Uint8Array,
  aad?: Uint8Array,
): Promise<Uint8Array> {
  return provider.decrypt({
    key,
    encrypted: {
      algorithm: "aes-256-gcm",
      ciphertext,
      nonce: iv,
      tag: authTag,
    },
    associatedData: aad,
  });
}
