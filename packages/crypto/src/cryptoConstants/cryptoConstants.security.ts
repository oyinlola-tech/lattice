import { TimeMs } from "@oyinlola141/lattice-constants";

/**
 * Password hashing constants.
 */
export const PASSWORD_HASH = Object.freeze({
  SALT_BYTES: 16,
  KEY_BYTES: 32,

  SCRYPT: Object.freeze({
    COST: 16_384,
    BLOCK_SIZE: 8,
    PARALLELIZATION: 1,
  }),

  PBKDF2: Object.freeze({
    ITERATIONS: 310_000,
    DIGEST: "sha256",
  }),
} as const);

/**
 * Password policy defaults.
 *
 * These values are intentionally conservative defaults.
 * Applications may impose stricter requirements.
 */
export const PASSWORD_POLICY = Object.freeze({
  MIN_LENGTH: 8,
  RECOMMENDED_MIN_LENGTH: 12,
  MAX_LENGTH: 1024,
} as const);

/**
 * Password reset and verification token lifetime defaults.
 *
 * Values are expressed in milliseconds.
 */
export const TOKEN_TTL = Object.freeze({
  EMAIL_VERIFICATION_MS:
    TimeMs.MINUTE * 15,

  PASSWORD_RESET_MS:
    TimeMs.MINUTE * 15,

  LOGIN_VERIFICATION_MS:
    TimeMs.MINUTE * 10,

  CSRF_MS:
    TimeMs.HOUR,

  SESSION_MS:
    24 * TimeMs.HOUR,

  REFRESH_TOKEN_MS:
    30 * 24 * TimeMs.HOUR,
} as const);
