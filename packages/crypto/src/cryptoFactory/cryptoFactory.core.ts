import {
  CryptoService,
  createCryptoService,
} from "../cryptoService/cryptoService.core.js";
import { CryptoAlgorithm } from "../cryptoConstants/cryptoConstants.type.js";
import { generateCryptoKey } from "../cryptoKey/cryptoKey.factory.js";
import {
  factoryCreateToken,
  factoryCreateApiKey,
  factoryCreateSessionToken,
  factoryCreateRefreshToken,
  factoryCreateVerificationToken,
  factoryCreatePasswordResetToken,
  factoryCreateCsrfToken,
  factoryCreateOtp,
} from "./cryptoFactory.token.js";
import {
  factoryCreatePasswordHash,
  factoryVerifyPassword,
} from "./cryptoFactory.password.js";
import { factoryEncode, factoryDecode } from "./cryptoFactory.encoding.js";
import type { CryptoKey } from "../cryptoKey/cryptoKey.type.js";
import type { PasswordHashOptions } from "./cryptoFactory.password.js";
import type { CryptoEncoding } from "./cryptoFactory.encoding.js";

/**
 * Configuration used to create a CryptoFactory.
 */
export interface CryptoFactoryOptions {
  readonly defaultKeyAlgorithm?: CryptoAlgorithm;
  readonly password?: PasswordHashOptions;
  readonly encoding?: CryptoEncoding;
}

/**
 * Central factory for constructing and accessing crypto services.
 */
export class CryptoFactory {
  private readonly options: Readonly<
    Required<Pick<CryptoFactoryOptions, "defaultKeyAlgorithm" | "encoding">>
  > &
    Omit<CryptoFactoryOptions, "defaultKeyAlgorithm" | "encoding">;
  private readonly service: CryptoService;

  constructor(options: CryptoFactoryOptions = {}) {
    this.options = Object.freeze({
      ...options,
      defaultKeyAlgorithm:
        options.defaultKeyAlgorithm ?? CryptoAlgorithm.AES_256_GCM,
      encoding: options.encoding ?? "base64url",
    });
    this.service = createCryptoService();
  }

  /** Returns the configured crypto service. */
  getService(): CryptoService {
    return this.service;
  }

  /** Generates a key using the configured default algorithm. */
  async createKey(
    algorithm = this.options.defaultKeyAlgorithm,
  ): Promise<CryptoKey> {
    const length = algorithm.includes("256")
      ? 32
      : algorithm.includes("384")
        ? 48
        : algorithm.includes("512")
          ? 64
          : 32;
    return generateCryptoKey(length, { algorithm, extractable: true });
  }

  /** Generates a secure opaque token. */
  async createToken(bytes = 32, prefix?: string): Promise<string> {
    return factoryCreateToken(
      bytes,
      prefix,
      this.options
        .encoding as import("../cryptoToken/cryptoToken.core.js").TokenEncoding,
    );
  }

  /** Generates an API key. */
  async createApiKey(): Promise<string> {
    return factoryCreateApiKey();
  }

  /** Generates a session token. */
  async createSessionToken(): Promise<string> {
    return factoryCreateSessionToken();
  }

  /** Generates a refresh token. */
  async createRefreshToken(): Promise<string> {
    return factoryCreateRefreshToken();
  }

  /** Generates an email or account verification token. */
  async createVerificationToken(): Promise<string> {
    return factoryCreateVerificationToken();
  }

  /** Generates a password reset token. */
  async createPasswordResetToken(): Promise<string> {
    return factoryCreatePasswordResetToken();
  }

  /** Generates a CSRF token. */
  async createCsrfToken(): Promise<string> {
    return factoryCreateCsrfToken();
  }

  /** Generates a numeric one-time password. */
  async createOtp(digits = 6): Promise<string> {
    return factoryCreateOtp(digits);
  }

  /** Hashes a password using the configured password options. */
  async createPasswordHash(password: string, options?: PasswordHashOptions) {
    return factoryCreatePasswordHash(
      password,
      options ?? this.options.password,
    );
  }

  /** Verifies a password against a stored hash. */
  async verifyPassword(
    password: string,
    encodedHash: string,
  ): Promise<boolean> {
    return factoryVerifyPassword(password, encodedHash);
  }

  /** Encodes bytes using the configured default encoding. */
  encode(value: Uint8Array, encoding = this.options.encoding): string {
    return factoryEncode(value, encoding);
  }

  /** Decodes binary data using the configured default encoding. */
  decode(value: string, encoding = this.options.encoding): Uint8Array {
    return factoryDecode(value, encoding);
  }

  /** Returns the factory configuration. */
  getOptions(): Readonly<CryptoFactoryOptions> {
    return Object.freeze({
      ...this.options,
      password: this.options.password
        ? Object.freeze({ ...this.options.password })
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
  return new CryptoFactory(options);
}

/**
 * Default application crypto factory.
 */
export const cryptoFactory = createCryptoFactory();
