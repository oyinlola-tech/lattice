import {
  CryptoService,
  createCryptoService,
} from "./crypto-service";

import {
  CryptoAlgorithm,
} from "./crypto-algorithm";

import type {
  CryptoKey,
} from "./crypto-key";

import {
  generateKey,
} from "./crypto-key";

import type {
  PasswordHashOptions,
} from "./crypto-password";

import {
  hashPassword,
  verifyPassword,
} from "./crypto-password";

import {
  generateToken,
  generateOtp,
  generateApiKey,
  generateSessionToken,
  generateRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
  generateCsrfToken,
} from "./crypto-token";

import {
  encode,
  decode,
} from "./crypto-encoding";

import type {
  CryptoEncoding,
} from "./crypto-encoding";

/**
 * Configuration used to create a CryptoFactory.
 */
export interface CryptoFactoryOptions {
  /**
   * Optional default key algorithm.
   */
  readonly defaultKeyAlgorithm?: CryptoAlgorithm;

  /**
   * Optional password hashing configuration.
   */
  readonly password?: PasswordHashOptions;

  /**
   * Default encoding for binary values.
   */
  readonly encoding?: CryptoEncoding;
}

/**
 * Central factory for constructing and accessing crypto services.
 *
 * The factory keeps application-level crypto configuration in one place
 * while allowing lower-level primitives to remain independently usable.
 */
export class CryptoFactory {
  private readonly options: Readonly<
    Required<
      Pick<
        CryptoFactoryOptions,
        "defaultKeyAlgorithm" | "encoding"
      >
    >
  > &
    Omit<
      CryptoFactoryOptions,
      "defaultKeyAlgorithm" | "encoding"
    >
  >;

  private readonly service: CryptoService;

  constructor(
    options: CryptoFactoryOptions = {},
  ) {
    this.options =
      Object.freeze({
        ...options,
        defaultKeyAlgorithm:
          options.defaultKeyAlgorithm ??
          CryptoAlgorithm.AES_256_GCM,
        encoding:
          options.encoding ??
          "base64url",
      });

    this.service =
      createCryptoService();
  }

  /**
   * Returns the configured crypto service.
   */
  public getService(): CryptoService {
    return this.service;
  }

  /**
   * Generates a key using the configured default algorithm.
   */
  public createKey(
    algorithm = this.options.defaultKeyAlgorithm,
  ): CryptoKey {
    return generateKey(
      algorithm,
    );
  }

  /**
   * Generates a secure opaque token.
   */
  public createToken(
    bytes = 32,
    prefix?: string,
  ): string {
    return generateToken({
      bytes,
      encoding:
        this.options.encoding,
      prefix,
    });
  }

  /**
   * Generates an API key.
   */
  public createApiKey(): string {
    return generateApiKey();
  }

  /**
   * Generates a session token.
   */
  public createSessionToken(): string {
    return generateSessionToken();
  }

  /**
   * Generates a refresh token.
   */
  public createRefreshToken(): string {
    return generateRefreshToken();
  }

  /**
   * Generates an email or account verification token.
   */
  public createVerificationToken(): string {
    return generateVerificationToken();
  }

  /**
   * Generates a password reset token.
   */
  public createPasswordResetToken(): string {
    return generatePasswordResetToken();
  }

  /**
   * Generates a CSRF token.
   */
  public createCsrfToken(): string {
    return generateCsrfToken();
  }

  /**
   * Generates a numeric one-time password.
   */
  public createOtp(
    digits = 6,
  ): string {
    return generateOtp(
      digits,
    );
  }

  /**
   * Hashes a password using the configured password options.
   */
  public async createPasswordHash(
    password: string,
    options?: PasswordHashOptions,
  ) {
    return hashPassword(
      password,
      options ??
        this.options.password,
    );
  }

  /**
   * Verifies a password against a stored hash.
   */
  public async verifyPassword(
    password: string,
    encodedHash: string,
  ): Promise<boolean> {
    return verifyPassword(
      password,
      encodedHash,
    );
  }

  /**
   * Encodes bytes using the configured default encoding.
   */
  public encode(
    value: Uint8Array,
    encoding = this.options.encoding,
  ): string {
    return encode(
      value,
      encoding,
    );
  }

  /**
   * Decodes binary data using the configured default encoding.
   */
  public decode(
    value: string,
    encoding = this.options.encoding,
  ): Uint8Array {
    return decode(
      value,
      encoding,
    );
  }

  /**
   * Returns the factory configuration.
   *
   * Password options are returned as-is and should not contain
   * plaintext passwords or secret key material.
   */
  public getOptions(): Readonly<CryptoFactoryOptions> {
    return Object.freeze({
      ...this.options,
      password: this.options.password
        ? Object.freeze({
            ...this.options.password,
          })
        : undefined,
    });
  }
}

/**
 * Creates a configured CryptoFactory.
 */
export function createCryptoFactory(
  options: CryptoFactoryOptions = {},
): CryptoFactory {
  return new CryptoFactory(
    options,
  );
}

/**
 * Default application crypto factory.
 */
export const cryptoFactory =
  createCryptoFactory();