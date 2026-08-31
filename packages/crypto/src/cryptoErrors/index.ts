/**
 * @lattice/crypto/cryptoErrors
 *
 * Cryptographic operation error types.
 *
 * Re-exports from @lattice/errors to maintain a single
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
} from "@lattice/errors";

export type {
  CryptoErrorOptions,
} from "@lattice/errors";
