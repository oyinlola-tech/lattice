import type {
  CipherOptions,
} from "./cryptoCipher.core.js";

import {
  encrypt,
  decrypt,
} from "./cryptoCipher.core.js";

/**
 * Creates an encrypted envelope suitable for storage or transport.
 *
 * The format is:
 *
 * version.algorithm.iv.authTag.ciphertext
 *
 * All binary fields are Base64URL encoded.
 */
export async function encryptEnvelope(
  plaintext: Uint8Array,
  key: Uint8Array,
  options: CipherOptions = {},
): Promise<string> {
  const result = await encrypt(plaintext, key, options);

  return [
    "v1",
    result.algorithm,
    Buffer.from(result.iv).toString("base64url"),
    Buffer.from(result.authTag).toString("base64url"),
    Buffer.from(result.ciphertext).toString("base64url"),
  ].join(".");
}

/**
 * Decrypts an encrypted envelope.
 */
export async function decryptEnvelope(
  envelope: string,
  key: Uint8Array,
  aad?: Uint8Array,
): Promise<Uint8Array> {
  if (typeof envelope !== "string") {
    throw new TypeError("Encrypted envelope must be a string.");
  }

  const parts = envelope.split(".");

  if (parts.length !== 5) {
    throw new TypeError("Invalid encrypted envelope.");
  }

  const [
    version,
    algorithm,
    encodedIv,
    encodedAuthTag,
    encodedCiphertext,
  ] = parts as [string, string, string, string, string];

  if (version !== "v1") {
    throw new TypeError(
      `Unsupported encrypted envelope version: ${version}.`,
    );
  }

  if (algorithm !== "aes-256-gcm") {
    throw new TypeError(
      `Unsupported envelope algorithm: ${algorithm}.`,
    );
  }

  const iv = decodeBase64Url(encodedIv);
  const authTag = decodeBase64Url(encodedAuthTag);
  const ciphertext = decodeBase64Url(encodedCiphertext);

  return decrypt(ciphertext, key, iv, authTag, aad);
}

function decodeBase64Url(value: string): Uint8Array {
  if (!/^[A-Za-z0-9_-]*$/.test(value)) {
    throw new TypeError("Invalid Base64URL value.");
  }

  return new Uint8Array(Buffer.from(value, "base64url"));
}
