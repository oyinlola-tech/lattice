/**
 * Base CryptoError class, options, and factory functions.
 */

import { BaseError } from "../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../base/types/baseError.type.js";
import { ErrorCategory } from "../base/types/errorCategory.type.js";
import { ErrorCode } from "../base/types/errorCode.type.js";
import { ErrorSeverity } from "../base/types/errorSeverity.type.js";

/** Cryptographic operation types used for diagnostics. */
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

/** Options for creating a cryptographic error. */
export interface CryptoErrorOptions extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly operation?: CryptoOperation;
  readonly algorithm?: string;
}

/** Error raised when a cryptographic operation fails. */
export class CryptoError extends BaseError {
  public readonly operation: CryptoOperation;
  public readonly algorithm?: string;

  constructor(
    message = "A cryptographic operation failed.",
    options: CryptoErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.CRYPTO,
      category: options.category ?? ErrorCategory.CRYPTOGRAPHY,
      severity: options.severity ?? ErrorSeverity.ERROR,
      statusCode: options.statusCode ?? 500,
      expose: options.expose ?? false,
      isOperational: options.isOperational ?? true,
      metadata: {
        ...options.metadata,
        ...(options.operation !== undefined
          ? { operation: options.operation }
          : {}),
        ...(options.algorithm !== undefined
          ? { algorithm: options.algorithm }
          : {}),
      },
    });
    this.operation = options.operation ?? CryptoOperation.UNKNOWN;
    this.algorithm = options.algorithm;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
      ...(this.algorithm !== undefined ? { algorithm: this.algorithm } : {}),
    };
  }
}

/** Creates a cryptographic error. */
export function createCryptoError(
  message = "A cryptographic operation failed.",
  options: CryptoErrorOptions = {},
): CryptoError {
  return new CryptoError(message, options);
}

/** Determines whether an unknown value is a CryptoError. */
export function isCryptoError(value: unknown): value is CryptoError {
  return value instanceof CryptoError;
}
