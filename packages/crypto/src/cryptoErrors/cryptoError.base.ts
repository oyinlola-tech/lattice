export enum CryptoErrorCode {
  INVALID_INPUT = "CRYPTO_INVALID_INPUT",
  INVALID_KEY = "CRYPTO_INVALID_KEY",
  INVALID_ALGORITHM = "CRYPTO_INVALID_ALGORITHM",
  INVALID_ENCODING = "CRYPTO_INVALID_ENCODING",
  INVALID_SIGNATURE = "CRYPTO_INVALID_SIGNATURE",
  INVALID_CIPHERTEXT = "CRYPTO_INVALID_CIPHERTEXT",
  DECRYPTION_FAILED = "CRYPTO_DECRYPTION_FAILED",
  ENCRYPTION_FAILED = "CRYPTO_ENCRYPTION_FAILED",
  HASH_FAILED = "CRYPTO_HASH_FAILED",
  KEY_DERIVATION_FAILED = "CRYPTO_KEY_DERIVATION_FAILED",
  KEY_GENERATION_FAILED = "CRYPTO_KEY_GENERATION_FAILED",
  SIGNING_FAILED = "CRYPTO_SIGNING_FAILED",
  VERIFICATION_FAILED = "CRYPTO_VERIFICATION_FAILED",
  PASSWORD_HASH_FAILED = "CRYPTO_PASSWORD_HASH_FAILED",
  PASSWORD_VERIFICATION_FAILED = "CRYPTO_PASSWORD_VERIFICATION_FAILED",
  TOKEN_GENERATION_FAILED = "CRYPTO_TOKEN_GENERATION_FAILED",
  TOKEN_INVALID = "CRYPTO_TOKEN_INVALID",
  TOKEN_EXPIRED = "CRYPTO_TOKEN_EXPIRED",
  KEY_NOT_EXTRACTABLE = "CRYPTO_KEY_NOT_EXTRACTABLE",
  UNSUPPORTED_OPERATION = "CRYPTO_UNSUPPORTED_OPERATION",
  INTERNAL_ERROR = "CRYPTO_INTERNAL_ERROR",
}

/**
 * Base error for all errors originating from the crypto package.
 */
export class CryptoError extends Error {
  public readonly code: CryptoErrorCode;

  public override readonly cause?: unknown;

  public readonly details?: Readonly<
    Record<string, unknown>
  >;

  public readonly timestamp: number;

  constructor(
    message: string,
    code: CryptoErrorCode = CryptoErrorCode.INTERNAL_ERROR,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(message);

    this.name =
      "CryptoError";

    this.code =
      code;

    this.cause =
      options?.cause;

    this.details =
      options?.details;

    this.timestamp =
      Date.now();

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }

  /**
   * Converts the error into a safe serializable representation.
   */
  public toJSON(): {
    readonly name: string;
    readonly code: CryptoErrorCode;
    readonly message: string;
    readonly timestamp: number;
    readonly details?: Readonly<
      Record<string, unknown>
    >;
  } {
    return {
      name: this.name,
      code: this.code,
      message: this.message,
      timestamp: this.timestamp,
      ...(this.details
        ? {
            details:
              this.details,
          }
        : {}),
    };
  }
}

/**
 * Error raised when crypto input is invalid.
 */
export class CryptoInputError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.INVALID_INPUT,
      options,
    );

    this.name =
      "CryptoInputError";
  }
}

/**
 * Error raised when a cryptographic key is invalid.
 */
export class CryptoKeyError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.INVALID_KEY,
      options,
    );

    this.name =
      "CryptoKeyError";
  }
}

/**
 * Error raised when an algorithm is unsupported or invalid.
 */
export class CryptoAlgorithmError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.INVALID_ALGORITHM,
      options,
    );

    this.name =
      "CryptoAlgorithmError";
  }
}

/**
 * Error raised when encoding or decoding fails.
 */
export class CryptoEncodingError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.INVALID_ENCODING,
      options,
    );

    this.name =
      "CryptoEncodingError";
  }
}

/**
 * Error raised when encryption fails.
 */
export class CryptoEncryptionError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.ENCRYPTION_FAILED,
      options,
    );

    this.name =
      "CryptoEncryptionError";
  }
}

/**
 * Error raised when decryption fails.
 */
export class CryptoDecryptionError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.DECRYPTION_FAILED,
      options,
    );

    this.name =
      "CryptoDecryptionError";
  }
}

/**
 * Error raised when hashing fails.
 */
export class CryptoHashError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.HASH_FAILED,
      options,
    );

    this.name =
      "CryptoHashError";
  }
}

/**
 * Error raised when key derivation fails.
 */
export class CryptoKeyDerivationError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.KEY_DERIVATION_FAILED,
      options,
    );

    this.name =
      "CryptoKeyDerivationError";
  }
}

/**
 * Error raised when signing fails.
 */
export class CryptoSigningError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.SIGNING_FAILED,
      options,
    );

    this.name =
      "CryptoSigningError";
  }
}

/**
 * Error raised when signature verification fails.
 */
export class CryptoVerificationError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.VERIFICATION_FAILED,
      options,
    );

    this.name =
      "CryptoVerificationError";
  }
}

/**
 * Error raised when password hashing fails.
 */
export class CryptoPasswordHashError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.PASSWORD_HASH_FAILED,
      options,
    );

    this.name =
      "CryptoPasswordHashError";
  }
}

/**
 * Error raised when a password cannot be verified.
 */
export class CryptoPasswordVerificationError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.PASSWORD_VERIFICATION_FAILED,
      options,
    );

    this.name =
      "CryptoPasswordVerificationError";
  }
}

/**
 * Error raised when token generation fails.
 */
export class CryptoTokenGenerationError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.TOKEN_GENERATION_FAILED,
      options,
    );

    this.name =
      "CryptoTokenGenerationError";
  }
}

/**
 * Error raised when a token is invalid.
 */
export class CryptoTokenError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.TOKEN_INVALID,
      options,
    );

    this.name =
      "CryptoTokenError";
  }
}

/**
 * Error raised when a token has expired.
 */
export class CryptoTokenExpiredError extends CryptoError {
  constructor(
    message = "Cryptographic token has expired.",
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.TOKEN_EXPIRED,
      options,
    );

    this.name =
      "CryptoTokenExpiredError";
  }
}

/**
 * Error raised when key material is not extractable.
 */
export class CryptoKeyNotExtractableError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.KEY_NOT_EXTRACTABLE,
      options,
    );

    this.name =
      "CryptoKeyNotExtractableError";
  }
}

/**
 * Error raised when an operation is not supported.
 */
export class CryptoUnsupportedOperationError extends CryptoError {
  constructor(
    message: string,
    options?: {
      readonly cause?: unknown;
      readonly details?: Readonly<
        Record<string, unknown>
      >;
    },
  ) {
    super(
      message,
      CryptoErrorCode.UNSUPPORTED_OPERATION,
      options,
    );

    this.name =
      "CryptoUnsupportedOperationError";
  }
}

/**
 * Converts an unknown thrown value into a CryptoError.
 */
export function toCryptoError(
  error: unknown,
  fallbackMessage = "Cryptographic operation failed.",
  code = CryptoErrorCode.INTERNAL_ERROR,
): CryptoError {
  if (
    error instanceof CryptoError
  ) {
    return error;
  }

  if (
    error instanceof Error
  ) {
    return new CryptoError(
      error.message ||
        fallbackMessage,
      code,
      {
        cause: error,
      },
    );
  }

  return new CryptoError(
    fallbackMessage,
    code,
    {
      cause: error,
    },
  );
}

/**
 * Determines whether an unknown value is a CryptoError.
 */
export function isCryptoError(
  error: unknown,
): error is CryptoError {
  return (
    error instanceof
    CryptoError
  );
}

/**
 * Determines whether an error has a particular crypto error code.
 */
export function hasCryptoErrorCode(
  error: unknown,
  code: CryptoErrorCode,
): boolean {
  return (
    isCryptoError(error) &&
    error.code === code
  );
}

/**
 * Creates a CryptoError while preserving the original cause.
 */
export function createCryptoError(
  code: CryptoErrorCode,
  message: string,
  cause?: unknown,
  details?: Readonly<
    Record<string, unknown>
  >,
): CryptoError {
  return new CryptoError(
    message,
    code,
    {
      cause,
      details,
    },
  );
}