import {
  createHash,
  randomBytes,
  timingSafeEqual,
} from "node:crypto";

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
export function generateToken(
  options: TokenOptions = {},
): string {
  const bytes =
    options.bytes ?? 32;

  const encoding =
    options.encoding ??
    "base64url";

  if (
    !Number.isInteger(bytes) ||
    bytes < 16
  ) {
    throw new RangeError(
      "Token byte length must be an integer of at least 16.",
    );
  }

  const token =
    randomBytes(
      bytes,
    ).toString(
      encoding,
    );

  return options.prefix
    ? `${options.prefix}${token}`
    : token;
}

/**
 * Generates a secure API key.
 */
export function generateApiKey(
  prefix = "lat_",
  bytes = 32,
): string {
  return generateToken({
    bytes,
    encoding:
      "base64url",
    prefix,
  });
}

/**
 * Generates a secure session token.
 */
export function generateSessionToken(
  bytes = 32,
): string {
  return generateToken({
    bytes,
    encoding:
      "base64url",
    prefix:
      "sess_",
  });
}

/**
 * Generates a secure refresh token.
 */
export function generateRefreshToken(
  bytes = 48,
): string {
  return generateToken({
    bytes,
    encoding:
      "base64url",
    prefix:
      "ref_",
  });
}

/**
 * Generates a secure verification token.
 */
export function generateVerificationToken(
  bytes = 32,
): string {
  return generateToken({
    bytes,
    encoding:
      "base64url",
    prefix:
      "verify_",
  });
}

/**
 * Generates a secure password-reset token.
 */
export function generatePasswordResetToken(
  bytes = 32,
): string {
  return generateToken({
    bytes,
    encoding:
      "base64url",
    prefix:
      "reset_",
  });
}

/**
 * Generates a secure CSRF token.
 */
export function generateCsrfToken(
  bytes = 32,
): string {
  return generateToken({
    bytes,
    encoding:
      "base64url",
    prefix:
      "csrf_",
  });
}

/**
 * Generates a numeric one-time password.
 *
 * Leading zeroes are preserved.
 */
export function generateOtp(
  digits = 6,
): string {
  if (
    !Number.isInteger(digits) ||
    digits < 4 ||
    digits > 12
  ) {
    throw new RangeError(
      "OTP digits must be an integer between 4 and 12.",
    );
  }

  const max =
    10 ** digits;

  const value =
    randomInteger(
      0,
      max,
    );

  return String(
    value,
  ).padStart(
    digits,
    "0",
  );
}

/**
 * Generates a short-lived email verification code.
 */
export function generateEmailVerificationCode(
  digits = 6,
): string {
  return generateOtp(
    digits,
  );
}

/**
 * Generates a short-lived login verification code.
 */
export function generateLoginCode(
  digits = 6,
): string {
  return generateOtp(
    digits,
  );
}

/**
 * Generates a secure random integer in the range
 * min <= value < max.
 */
export function randomInteger(
  min: number,
  max: number,
): number {
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max)
  ) {
    throw new TypeError(
      "Token random integer bounds must be integers.",
    );
  }

  if (
    max <= min
  ) {
    throw new RangeError(
      "max must be greater than min.",
    );
  }

  const range =
    max - min;

  if (
    range <= 0 ||
    range > 2 ** 48
  ) {
    throw new RangeError(
      "Random integer range is outside the supported bounds.",
    );
  }

  const maxUnbiased =
    Math.floor(
      2 ** 48 / range,
    ) * range;

  while (true) {
    const bytes =
      randomBytes(6);

    let value = 0;

    for (
      const byte of bytes
    ) {
      value =
        value * 256 +
        byte;
    }

    if (
      value <
      maxUnbiased
    ) {
      return (
        min +
        (value % range)
      );
    }
  }
}

/**
 * Creates a deterministic SHA-256 identifier from a token.
 *
 * The returned value does not expose the original token.
 */
export function hashToken(
  token: string,
): string {
  assertToken(
    token,
  );

  return createHash(
    "sha256",
  )
    .update(
      token,
      "utf8",
    )
    .digest(
      "hex",
    );
}

/**
 * Creates a Base64URL SHA-256 digest of a token.
 */
export function hashTokenBase64Url(
  token: string,
): string {
  assertToken(
    token,
  );

  return createHash(
    "sha256",
  )
    .update(
      token,
      "utf8",
    )
    .digest(
      "base64url",
    );
}

/**
 * Compares a token with a stored hash.
 */
export function verifyTokenHash(
  token: string,
  expectedHash: string,
): boolean {
  try {
    const actual =
      Buffer.from(
        hashToken(token),
        "hex",
      );

    const expected =
      Buffer.from(
        expectedHash,
        "hex",
      );

    if (
      actual.byteLength !==
      expected.byteLength
    ) {
      return false;
    }

    return timingSafeEqual(
      actual,
      expected,
    );
  } catch {
    return false;
  }
}

/**
 * Hashes a token using SHA-256 before storage.
 *
 * This is useful when a raw bearer token must never be persisted.
 */
export function hashTokenForStorage(
  token: string,
): string {
  return hashToken(
    token,
  );
}

/**
 * Removes a known token prefix.
 */
export function removeTokenPrefix(
  token: string,
  prefix: string,
): string {
  assertToken(
    token,
  );

  if (
    token.startsWith(prefix)
  ) {
    return token.slice(
      prefix.length,
    );
  }

  return token;
}

/**
 * Checks whether a token has the expected prefix.
 */
export function hasTokenPrefix(
  token: string,
  prefix: string,
): boolean {
  return (
    typeof token ===
      "string" &&
    typeof prefix ===
      "string" &&
    token.startsWith(prefix)
  );
}

/**
 * Validates the basic shape of an opaque token.
 */
export function isValidToken(
  token: string,
  minimumLength = 16,
): boolean {
  return (
    typeof token ===
      "string" &&
    token.length >=
      minimumLength
  );
}

function assertToken(
  token: string,
): void {
  if (
    typeof token !==
      "string" ||
    token.length === 0
  ) {
    throw new TypeError(
      "Token must be a non-empty string.",
    );
  }
}