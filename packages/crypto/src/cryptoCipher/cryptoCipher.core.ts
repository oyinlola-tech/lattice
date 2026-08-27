import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

import type {
  CryptoAlgorithm,
} from "../cryptoAlgorithm/cryptoAlgorithm.type.js";

import {
  CryptoAlgorithm as Algorithm,
} from "../cryptoAlgorithm/cryptoAlgorithm.type.js";

import type {
  CryptoKey,
} from "../cryptoKey/cryptoKey.type.js";

/**
 * Authenticated encryption result.
 */
export interface CipherResult {
  readonly algorithm: CryptoAlgorithm;
  readonly ciphertext: Uint8Array;
  readonly iv: Uint8Array;
  readonly authTag: Uint8Array;
}

/**
 * Options used when encrypting data.
 */
export interface CipherOptions {
  readonly iv?: Uint8Array;
  readonly aad?: Uint8Array;
}

/**
 * Encrypts data using AES-256-GCM.
 *
 * AES-256-GCM requires a 32-byte key and uses a 12-byte IV by default.
 */
export function encrypt(
  plaintext: Uint8Array,
  key: CryptoKey,
  options: CipherOptions = {},
): CipherResult {
  assertAlgorithm(
    key.algorithm,
  );

  assertKeyLength(
    key,
    32,
  );

  const iv =
    options.iv
      ? new Uint8Array(
          options.iv,
        )
      : randomBytes(12);

  if (
    iv.byteLength !== 12
  ) {
    throw new RangeError(
      "AES-256-GCM requires a 12-byte IV.",
    );
  }

  const cipher =
    createCipheriv(
      "aes-256-gcm",
      Buffer.from(
        key.bytes(),
      ),
      Buffer.from(iv),
    );

  if (
    options.aad
  ) {
    cipher.setAAD(
      Buffer.from(
        options.aad,
      ),
    );
  }

  const ciphertext =
    Buffer.concat([
      cipher.update(
        Buffer.from(
          plaintext,
        ),
      ),
      cipher.final(),
    ]);

  const authTag =
    cipher.getAuthTag();

  return Object.freeze({
    algorithm:
      Algorithm.AES_256_GCM,
    ciphertext:
      new Uint8Array(
        ciphertext,
      ),
    iv:
      new Uint8Array(
        iv,
      ),
    authTag:
      new Uint8Array(
        authTag,
      ),
  });
}

/**
 * Decrypts AES-256-GCM ciphertext.
 */
export function decrypt(
  ciphertext: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array,
  authTag: Uint8Array,
  aad?: Uint8Array,
): Uint8Array {
  assertAlgorithm(
    key.algorithm,
  );

  assertKeyLength(
    key,
    32,
  );

  if (
    iv.byteLength !== 12
  ) {
    throw new RangeError(
      "AES-256-GCM requires a 12-byte IV.",
    );
  }

  if (
    authTag.byteLength !== 16
  ) {
    throw new RangeError(
      "AES-256-GCM requires a 16-byte authentication tag.",
    );
  }

  const decipher =
    createDecipheriv(
      "aes-256-gcm",
      Buffer.from(
        key.bytes(),
      ),
      Buffer.from(iv),
    );

  if (
    aad
  ) {
    decipher.setAAD(
      Buffer.from(aad),
    );
  }

  decipher.setAuthTag(
    Buffer.from(
      authTag,
    ),
  );

  const plaintext =
    Buffer.concat([
      decipher.update(
        Buffer.from(
          ciphertext,
        ),
      ),
      decipher.final(),
    ]);

  return new Uint8Array(
    plaintext,
  );
}

/**
 * Encrypts a UTF-8 string using AES-256-GCM.
 */
export function encryptString(
  plaintext: string,
  key: CryptoKey,
  options: CipherOptions = {},
): CipherResult {
  return encrypt(
    new Uint8Array(
      Buffer.from(
        plaintext,
        "utf8",
      ),
    ),
    key,
    options,
  );
}

/**
 * Decrypts AES-256-GCM ciphertext into a UTF-8 string.
 */
export function decryptString(
  ciphertext: Uint8Array,
  key: CryptoKey,
  iv: Uint8Array,
  authTag: Uint8Array,
  aad?: Uint8Array,
): string {
  const plaintext =
    decrypt(
      ciphertext,
      key,
      iv,
      authTag,
      aad,
    );

  return Buffer.from(
    plaintext,
  ).toString(
    "utf8",
  );
}

/**
 * Creates an encrypted envelope suitable for storage or transport.
 *
 * The format is:
 *
 * version.algorithm.iv.authTag.ciphertext
 *
 * All binary fields are Base64URL encoded.
 */
export function encryptEnvelope(
  plaintext: Uint8Array,
  key: CryptoKey,
  options: CipherOptions = {},
): string {
  const result =
    encrypt(
      plaintext,
      key,
      options,
    );

  return [
    "v1",
    result.algorithm,
    Buffer.from(
      result.iv,
    ).toString(
      "base64url",
    ),
    Buffer.from(
      result.authTag,
    ).toString(
      "base64url",
    ),
    Buffer.from(
      result.ciphertext,
    ).toString(
      "base64url",
    ),
  ].join(".");
}

/**
 * Decrypts an encrypted envelope.
 */
export function decryptEnvelope(
  envelope: string,
  key: CryptoKey,
  aad?: Uint8Array,
): Uint8Array {
  if (
    typeof envelope !==
      "string"
  ) {
    throw new TypeError(
      "Encrypted envelope must be a string.",
    );
  }

  const parts =
    envelope.split(".");

  if (
    parts.length !== 5
  ) {
    throw new TypeError(
      "Invalid encrypted envelope.",
    );
  }

  const [
    version,
    algorithm,
    encodedIv,
    encodedAuthTag,
    encodedCiphertext,
  ] = parts as [string, string, string, string, string];

  if (
    version !== "v1"
  ) {
    throw new TypeError(
      `Unsupported encrypted envelope version: ${version}.`,
    );
  }

  if (
    algorithm !==
    Algorithm.AES_256_GCM
  ) {
    throw new TypeError(
      `Unsupported envelope algorithm: ${algorithm}.`,
    );
  }

  if (
    key.algorithm !==
    Algorithm.AES_256_GCM
  ) {
    throw new TypeError(
      "The supplied key does not match the envelope algorithm.",
    );
  }

  const iv =
    decodeBase64Url(
      encodedIv,
    );

  const authTag =
    decodeBase64Url(
      encodedAuthTag,
    );

  const ciphertext =
    decodeBase64Url(
      encodedCiphertext,
    );

  return decrypt(
    ciphertext,
    key,
    iv,
    authTag,
    aad,
  );
}

function assertAlgorithm(
  algorithm: CryptoAlgorithm,
): void {
  if (
    algorithm !==
    Algorithm.AES_256_GCM
  ) {
    throw new TypeError(
      `Unsupported cipher algorithm: ${algorithm}.`,
    );
  }
}

function assertKeyLength(
  key: CryptoKey,
  expectedBytes: number,
): void {
  if (
    key.length !==
    expectedBytes * 8
  ) {
    throw new RangeError(
      `AES-256-GCM requires a ${expectedBytes}-byte key.`,
    );
  }
}

function decodeBase64Url(
  value: string,
): Uint8Array {
  if (
    !/^[A-Za-z0-9_-]*$/.test(
      value,
    )
  ) {
    throw new TypeError(
      "Invalid Base64URL value.",
    );
  }

  return new Uint8Array(
    Buffer.from(
      value,
      "base64url",
    ),
  );
}