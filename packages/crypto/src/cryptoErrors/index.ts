/**
 * @zudojs/crypto/cryptoErrors
 *
 * Cryptographic operation error types.
 *
 * Re-exports from @zudojs/errors to maintain a single
 * error hierarchy across the framework.
 */

export {
  CryptoError,
  CryptoOperation,
  createCryptoError,
  isCryptoError,
  cryptoHashError,
  cryptoCipherError,
  cryptoSignatureError,
  cryptoKeyDerivationError,
  cryptoKeyError,
} from "@zudojs/errors";

export type { CryptoErrorOptions } from "@zudojs/errors";
