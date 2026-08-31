import type { SignatureAlgorithm } from "../cryptoProvider.type.js";

/**
 * Options for signing.
 */
export interface SignOptions {
  readonly key: Uint8Array;
  readonly data: Uint8Array;
  readonly algorithm?: SignatureAlgorithm;
}

/**
 * Options for verification.
 */
export interface VerifyOptions {
  readonly key: Uint8Array;
  readonly data: Uint8Array;
  readonly signature: Uint8Array;
  readonly algorithm?: SignatureAlgorithm;
}
