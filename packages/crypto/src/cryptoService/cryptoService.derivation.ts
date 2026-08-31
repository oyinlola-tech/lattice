import type {
  DerivedKeyResult,
} from "../cryptoProvider/index.js";

import type {
  Pbkdf2Options,
  ScryptOptions,
} from "../cryptoKeyDerivation/cryptoKeyDerivation.type.js";

import {
  deriveKey,
} from "../cryptoKeyDerivation/cryptoKeyDerivation.core.js";

import {
  cryptoKeyDerivationError,
} from "@lattice/errors";

import {
  CryptoAlgorithm,
} from "../cryptoConstants/cryptoConstants.type.js";

export type { DerivedKeyResult, Pbkdf2Options, ScryptOptions };

export async function serviceDeriveKey(
  password: string | Uint8Array,
  algorithm: CryptoAlgorithm,
  options?: Pbkdf2Options | ScryptOptions,
): Promise<DerivedKeyResult> {
  try {
    return await deriveKey(password, algorithm, options);
  } catch {
    throw cryptoKeyDerivationError(
      "Key derivation failed.",
      algorithm,
    );
  }
}
