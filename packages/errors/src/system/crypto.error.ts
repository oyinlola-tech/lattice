import { BaseError } from "../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../base/types/baseError.type.js";

import {
  ErrorCategory,
} from "../base/types/errorCategory.type.js";

import {
  ErrorCode,
} from "../base/types/errorCode.type.js";

import {
  ErrorSeverity,
} from "../base/types/errorSeverity.type.js";

/**
 * Cryptographic operation types used for diagnostics.
 */
export enum CryptoOperation {
  UNKNOWN = "unknown",
  HASH = "hash",
  VERIFY_HASH = "verify_hash",
  ENCRYPT = "encrypt",
  DECRYPT = "decrypt",
  SIGN = "sign",
  VERIFY_SIGNATURE = "verify_signature",
  KEY_GENERATION = "key_generation",
  KEY_DERIVATION = "key_derivation",
  KEY_IMPORT = "key_import",
  KEY_EXPORT = "key_export",
  RANDOM = "random",
  ENCODE = "encode",
  DECODE = "decode",
}

/**
 * Options for creating a cryptographic error.
 */
export interface CryptoErrorOptions
  extends Omit<
    BaseErrorOptions,
    "category"
  > {
  readonly category?: ErrorCategory;
  readonly operation?: CryptoOperation;
  readonly algorithm?: string;
}

/**
 * Error raised when a cryptographic operation fails.
 *
 * Cryptographic errors are intentionally not exposed by default because
 * their underlying causes may reveal sensitive implementation details.
 */
export class CryptoError
  extends BaseError {
  public readonly operation: CryptoOperation;

  public readonly algorithm?: string;

  constructor(
    message =
      "A cryptographic operation failed.",
    options: CryptoErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.CRYPTO,
        category:
          options.category ??
          ErrorCategory.CRYPTOGRAPHY,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ??
          500,
        expose:
          options.expose ??
          false,
        isOperational:
          options.isOperational ??
          true,
        metadata: {
          ...options.metadata,
          ...(options.operation !==
          undefined
            ? {
                operation:
                  options.operation,
              }
            : {}),
          ...(options.algorithm !==
          undefined
            ? {
                algorithm:
                  options.algorithm,
              }
            : {}),
        },
      },
    );

    this.operation =
      options.operation ??
      CryptoOperation.UNKNOWN;

    this.algorithm =
      options.algorithm;
  }

  /**
   * Returns a serialized representation with cryptographic diagnostics.
   */
  public override toJSON() {
    return {
      ...super.toJSON(),
      operation:
        this.operation,
      ...(this.algorithm !==
      undefined
        ? {
            algorithm:
              this.algorithm,
          }
        : {}),
    };
  }
}

/**
 * Creates a cryptographic error.
 */
export function createCryptoError(
  message =
    "A cryptographic operation failed.",
  options: CryptoErrorOptions = {},
): CryptoError {
  return new CryptoError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is a CryptoError.
 */
export function isCryptoError(
  value: unknown,
): value is CryptoError {
  return (
    value instanceof CryptoError
  );
}

/**
 * Creates a hashing error.
 */
export function cryptoHashError(
  message =
    "Cryptographic hashing failed.",
  algorithm?: string,
): CryptoError {
  return new CryptoError(
    message,
    {
      code:
        ErrorCode.CRYPTO_HASH,
      operation:
        CryptoOperation.HASH,
      algorithm,
    },
  );
}

/**
 * Creates an encryption or cipher error.
 */
export function cryptoCipherError(
  message =
    "Cryptographic encryption or decryption failed.",
  operation:
    | CryptoOperation.ENCRYPT
    | CryptoOperation.DECRYPT =
    CryptoOperation.ENCRYPT,
  algorithm?: string,
): CryptoError {
  return new CryptoError(
    message,
    {
      code:
        ErrorCode.CRYPTO_CIPHER,
      operation,
      algorithm,
    },
  );
}

/**
 * Creates a cryptographic signature error.
 */
export function cryptoSignatureError(
  message =
    "Cryptographic signature verification failed.",
  operation:
    | CryptoOperation.SIGN
    | CryptoOperation.VERIFY_SIGNATURE =
    CryptoOperation.VERIFY_SIGNATURE,
  algorithm?: string,
): CryptoError {
  return new CryptoError(
    message,
    {
      code:
        ErrorCode.CRYPTO_SIGNATURE,
      operation,
      algorithm,
    },
  );
}

/**
 * Creates a key derivation error.
 */
export function cryptoKeyDerivationError(
  message =
    "Cryptographic key derivation failed.",
  algorithm?: string,
): CryptoError {
  return new CryptoError(
    message,
    {
      code:
        ErrorCode.CRYPTO_DERIVATION,
      operation:
        CryptoOperation.KEY_DERIVATION,
      algorithm,
    },
  );
}

/**
 * Creates a cryptographic key error.
 */
export function cryptoKeyError(
  message =
    "Cryptographic key operation failed.",
  operation:
    | CryptoOperation.KEY_GENERATION
    | CryptoOperation.KEY_IMPORT
    | CryptoOperation.KEY_EXPORT =
    CryptoOperation.KEY_GENERATION,
  algorithm?: string,
): CryptoError {
  return new CryptoError(
    message,
    {
      code:
        ErrorCode.CRYPTO_KEY,
      operation,
      algorithm,
    },
  );
}