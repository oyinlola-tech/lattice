import { createNodeCryptoProvider } from "../node/index.js";

import type {
  KeyDerivationAlgorithm,
  CryptoInput,
  DerivedKeyResult,
} from "../cryptoProvider/index.js";

import { CryptoAlgorithm } from "../cryptoConstants/cryptoConstants.type.js";

import type {
  Pbkdf2Options,
  ScryptOptions,
} from "./cryptoKeyDerivation.type.js";

import {
  validatePbkdf2Options,
  validateScryptOptions,
} from "./cryptoKeyDerivation.validate.js";

const provider = createNodeCryptoProvider();

/**
 * Derives a key from a password using PBKDF2.
 */
export async function derivePbkdf2(
  password: string | Uint8Array,
  options: Pbkdf2Options = {},
): Promise<DerivedKeyResult> {
  const iterations = options.iterations ?? 310_000;
  const keyLength = options.keyLength ?? 32;
  const salt =
    options.salt ??
    new Uint8Array(
      await provider.randomBytes(options.saltLength ?? 16),
    );
  const digest = options.digest ?? "sha256";

  validatePbkdf2Options(iterations, keyLength, salt);

  const key = await provider.deriveKey({
    password,
    salt,
    algorithm: "pbkdf2",
    keyLength,
    iterations,
  });

  return Object.freeze({
    algorithm:
      digest === "sha512"
        ? CryptoAlgorithm.PBKDF2_SHA512 as KeyDerivationAlgorithm
        : CryptoAlgorithm.PBKDF2_SHA256 as KeyDerivationAlgorithm,
    key,
    salt: new Uint8Array(salt),
  });
}

/**
 * Derives a key using scrypt.
 */
export async function deriveScrypt(
  password: string | Uint8Array,
  options: ScryptOptions = {},
): Promise<DerivedKeyResult> {
  const keyLength = options.keyLength ?? 32;
  const cost = options.cost ?? 16_384;
  const blockSize = options.blockSize ?? 8;
  const parallelization = options.parallelization ?? 1;
  const salt =
    options.salt ??
    new Uint8Array(
      await provider.randomBytes(options.saltLength ?? 16),
    );

  validateScryptOptions(
    keyLength,
    cost,
    blockSize,
    parallelization,
    salt,
  );

  const key = await provider.deriveKey({
    password: password instanceof Uint8Array ? password : Buffer.from(password, "utf8"),
    salt,
    algorithm: "scrypt",
    keyLength,
    memoryCost: cost,
    parallelism: parallelization,
  });

  return Object.freeze({
    algorithm: CryptoAlgorithm.SCRYPT as KeyDerivationAlgorithm,
    key,
    salt: new Uint8Array(salt),
  });
}

/**
 * Derives a key using the selected key derivation algorithm.
 */
export async function deriveKey(
  password: string | Uint8Array,
  algorithm: CryptoAlgorithm,
  options: Pbkdf2Options | ScryptOptions = {},
): Promise<DerivedKeyResult> {
  switch (algorithm) {
    case CryptoAlgorithm.PBKDF2_SHA256:
      return derivePbkdf2(password, {
        ...(options as Pbkdf2Options),
        digest: "sha256",
      });

    case CryptoAlgorithm.PBKDF2_SHA512:
      return derivePbkdf2(password, {
        ...(options as Pbkdf2Options),
        digest: "sha512",
      });

    case CryptoAlgorithm.SCRYPT:
      return deriveScrypt(password, options as ScryptOptions);

    default:
      throw new TypeError(
        `Unsupported key derivation algorithm: ${algorithm}.`,
      );
  }
}
