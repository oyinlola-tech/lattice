import type { HashAlgorithm } from "../cryptoProvider.type.js";

/**
 * Result of a hash operation.
 */
export interface HashResult {
  readonly algorithm: HashAlgorithm;
  readonly digest: Uint8Array;
  readonly encoded: string;
}

/**
 * Supported hash output encodings.
 */
export type HashEncoding = "hex" | "base64" | "base64url";
