import type {
  EncryptionAlgorithm,
  CryptoInput,
  EncryptedData,
} from "../../../cryptoProvider/index.js";
import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { toBytes } from "../nodeCryptoProvider.helper.js";

export async function encrypt(options: {
  key: CryptoInput;
  plaintext: CryptoInput;
  associatedData?: CryptoInput;
  nonce?: Uint8Array;
}): Promise<EncryptedData> {
  const key = toBytes(options.key);
  const plaintext = toBytes(options.plaintext);

  const algorithm: EncryptionAlgorithm = "aes-256-gcm";
  const nonce = options.nonce ?? new Uint8Array(randomBytes(12));

  const cipher = createCipheriv("aes-256-gcm", key, nonce);

  if (options.associatedData) {
    cipher.setAAD(toBytes(options.associatedData));
  }

  const ciphertext = Buffer.concat([cipher.update(plaintext), cipher.final()]);

  const tag = cipher.getAuthTag();

  return Object.freeze({
    algorithm,
    ciphertext: new Uint8Array(ciphertext),
    nonce,
    tag: new Uint8Array(tag),
  });
}

export async function decrypt(options: {
  key: CryptoInput;
  encrypted: EncryptedData;
  associatedData?: CryptoInput;
}): Promise<Uint8Array> {
  const key = toBytes(options.key);
  const { ciphertext, nonce, tag } = options.encrypted;

  const decipher = createDecipheriv(
    options.encrypted.algorithm,
    key,
    nonce,
  ) as unknown as {
    setAAD(data: Uint8Array): void;
    setAuthTag(tag: Uint8Array): void;
    update(data: Uint8Array): Buffer;
    final(): Buffer;
  };

  if (options.associatedData) {
    decipher.setAAD(toBytes(options.associatedData));
  }

  decipher.setAuthTag(tag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return new Uint8Array(decrypted);
}
