import type { EncodingFormat } from "../cryptoProvider.type.js";

/**
 * Options for random token generation.
 */
export interface RandomTokenOptions {
  readonly bytes?: number;
  readonly encoding?: EncodingFormat;
}
