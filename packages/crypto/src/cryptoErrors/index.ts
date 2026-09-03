/**
 * @zudo/crypto/cryptoErrors
 *
 * Cryptographic operation error types.
 *
 * Re-exports from @zudo/errors to maintain a single
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
} from "@zudo/errors";

export type { CryptoErrorOptions } from "@zudo/errors";
