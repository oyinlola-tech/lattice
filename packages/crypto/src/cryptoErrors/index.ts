/**
 * @zudoliblib/crypto/cryptoErrors
 *
 * Cryptographic operation error types.
 *
 * Re-exports from @zudoliblib/errors to maintain a single
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
} from "@zudoliblib/errors";

export type { CryptoErrorOptions } from "@zudoliblib/errors";
