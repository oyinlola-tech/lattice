import type {
  KeyDerivationAlgorithm,
  CryptoInput,
} from "../cryptoProvider.type.js";

/**
 * Result of a key derivation operation.
 */
export interface DerivedKeyResult {
  readonly key: Uint8Array;
  readonly salt: Uint8Array;
  readonly algorithm: KeyDerivationAlgorithm;
}

/**
 * Options for key derivation.
 */
export interface DeriveKeyOptions {
  readonly password: CryptoInput;
  readonly salt: Uint8Array;
  readonly algorithm: KeyDerivationAlgorithm;
  readonly keyLength?: number;
  readonly iterations?: number;
  readonly memoryCost?: number;
  readonly parallelism?: number;
}
