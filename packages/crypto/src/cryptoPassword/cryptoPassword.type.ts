import { CryptoAlgorithm } from "../cryptoConstants/cryptoConstants.type.js";

/**
 * Options used for password hashing.
 */
export interface PasswordHashOptions {
  readonly saltBytes?: number;
  readonly keyBytes?: number;
  readonly cost?: number;
  readonly blockSize?: number;
  readonly parallelization?: number;
}

/**
 * Result returned by password hashing.
 */
export interface PasswordHashResult {
  readonly algorithm: CryptoAlgorithm;
  readonly version: string;
  readonly salt: Uint8Array;
  readonly hash: Uint8Array;
  readonly encoded: string;
  readonly cost: number;
  readonly blockSize: number;
  readonly parallelization: number;
}

/**
 * Parameters encoded into a password hash.
 */
export interface PasswordHashParameters {
  readonly version: string;
  readonly algorithm: CryptoAlgorithm;
  readonly salt: Uint8Array;
  readonly hash: Uint8Array;
  readonly cost: number;
  readonly blockSize: number;
  readonly parallelization: number;
}
