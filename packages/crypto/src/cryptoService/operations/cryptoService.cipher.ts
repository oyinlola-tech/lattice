import type {
  CipherOptions,
  CipherResult,
} from "../../cryptoCipher/cryptoCipher.core.js";

import { encrypt, decrypt } from "../../cryptoCipher/cryptoCipher.core.js";

import { cryptoCipherError, CryptoOperation } from "@zudolib/errors";

export type { CipherOptions, CipherResult };

export async function serviceEncrypt(
  plaintext: Uint8Array,
  key: Uint8Array,
  options?: CipherOptions,
): Promise<CipherResult> {
  try {
    return await encrypt(plaintext, key, options);
  } catch {
    throw cryptoCipherError("Encryption failed.", CryptoOperation.ENCRYPT);
  }
}

export async function serviceDecrypt(
  ciphertext: Uint8Array,
  key: Uint8Array,
  iv: Uint8Array,
  authTag: Uint8Array,
  aad?: Uint8Array,
): Promise<Uint8Array> {
  try {
    return await decrypt(ciphertext, key, iv, authTag, aad);
  } catch {
    throw cryptoCipherError("Decryption failed.", CryptoOperation.DECRYPT);
  }
}
