import { createNodeCryptoProvider } from "../node/index.js";

import { randomInteger } from "../cryptoRandom/cryptoRandom.core.js";

import type { CryptoProvider } from "../cryptoProvider/index.js";

let defaultProvider: CryptoProvider | undefined;

/**
 * Returns a lazily created default crypto provider.
 *
 * The provider abstraction keeps token generation free of direct
 * `node:crypto` usage while still allowing callers to inject their own.
 */
function getDefaultProvider(): CryptoProvider {
  if (defaultProvider === undefined) {
    defaultProvider = createNodeCryptoProvider();
  }

  return defaultProvider;
}

/**
 * Supported token encodings.
 */
export type TokenEncoding =
  | "hex"
  | "base64"
  | "base64url";

/**
 * Options for generating a secure token.
 */
export interface TokenOptions {
  readonly bytes?: number;
  readonly encoding?: TokenEncoding;
  readonly prefix?: string;
}

/**
 * Creates a cryptographically secure opaque token.
 */
export async function generateToken(
  options: TokenOptions = {},
): Promise<string> {
  const bytes = options.bytes ?? 32;
  const encoding = options.encoding ?? "base64url";

  if (!Number.isInteger(bytes) || bytes < 16) {
    throw new RangeError(
      "Token byte length must be an integer of at least 16.",
    );
  }

  const raw = await getDefaultProvider().randomBytes(bytes);
  const token = Buffer.from(raw).toString(encoding);

  return options.prefix ? `${options.prefix}${token}` : token;
}

/**
 * Generates a secure API key.
 */
export async function generateApiKey(prefix = "lat_", bytes = 32): Promise<string> {
  return generateToken({ bytes, encoding: "base64url", prefix });
}

/**
 * Generates a secure session token.
 */
export async function generateSessionToken(
  bytes = 32,
): Promise<string> {
  return generateToken({ bytes, encoding: "base64url", prefix: "sess_" });
}

/**
 * Generates a secure refresh token.
 */
export async function generateRefreshToken(
  bytes = 48,
): Promise<string> {
  return generateToken({ bytes, encoding: "base64url", prefix: "ref_" });
}

/**
 * Generates a secure verification token.
 */
export async function generateVerificationToken(
  bytes = 32,
): Promise<string> {
  return generateToken({ bytes, encoding: "base64url", prefix: "verify_" });
}

/**
 * Generates a secure password-reset token.
 */
export async function generatePasswordResetToken(
  bytes = 32,
): Promise<string> {
  return generateToken({ bytes, encoding: "base64url", prefix: "reset_" });
}

/**
 * Generates a secure CSRF token.
 */
export async function generateCsrfToken(
  bytes = 32,
): Promise<string> {
  return generateToken({ bytes, encoding: "base64url", prefix: "csrf_" });
}

/**
 * Generates a numeric one-time password.
 *
 * Leading zeroes are preserved.
 */
export async function generateOtp(
  digits = 6,
): Promise<string> {
  if (!Number.isInteger(digits) || digits < 4 || digits > 12) {
    throw new RangeError(
      "OTP digits must be an integer between 4 and 12.",
    );
  }

  const max = 10 ** digits;
  const value = await randomInteger(0, max);

  return String(value).padStart(digits, "0");
}

/**
 * Generates a short-lived email verification code.
 */
export async function generateEmailVerificationCode(
  digits = 6,
): Promise<string> {
  return generateOtp(digits);
}

/**
 * Generates a short-lived login verification code.
 */
export async function generateLoginCode(
  digits = 6,
): Promise<string> {
  return generateOtp(digits);
}
