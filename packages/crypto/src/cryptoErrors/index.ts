/**
 * @zudolib/crypto/cryptoErrors
 *
 * Cryptographic operation error types.
 *
 * Re-exports from @zudolib/errors to maintain a single
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
} from "@zudolib/errors";

export type { CryptoErrorOptions } from "@zudolib/errors";
