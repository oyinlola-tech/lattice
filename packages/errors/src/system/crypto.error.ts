/**
 * Crypto error classes — re-exports from focused files.
 */

export {
  CryptoError,
  createCryptoError,
  isCryptoError,
  CryptoOperation,
} from "./cryptoError.base.js";
export type { CryptoErrorOptions } from "./cryptoError.base.js";

export {
  cryptoHashError,
  cryptoCipherError,
  cryptoSignatureError,
  cryptoKeyDerivationError,
  cryptoKeyError,
} from "./cryptoError.factory.js";
