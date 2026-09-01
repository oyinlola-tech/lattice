/**
 * @oyinlola141/lattice-crypto/cryptoErrors
 *
 * Cryptographic operation error types.
 *
 * Re-exports from @oyinlola141/lattice-errors to maintain a single
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
} from "@oyinlola141/lattice-errors";

export type { CryptoErrorOptions } from "@oyinlola141/lattice-errors";
