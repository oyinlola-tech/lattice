import type { PasswordHashOptions } from "./cryptoPassword.type.js";

/**
 * Validates the structural constraints of password hashing parameters.
 */
export function validateParameters(
  parameters: {
    readonly saltBytes: number;
    readonly keyBytes: number;
    readonly cost: number;
    readonly blockSize: number;
    readonly parallelization: number;
  },
): void {
  if (
    !Number.isInteger(parameters.saltBytes) ||
    parameters.saltBytes < 16
  ) {
    throw new RangeError(
      "saltBytes must be an integer of at least 16.",
    );
  }

  if (
    !Number.isInteger(parameters.keyBytes) ||
    parameters.keyBytes < 16
  ) {
    throw new RangeError(
      "keyBytes must be an integer of at least 16.",
    );
  }

  if (
    !Number.isInteger(parameters.cost) ||
    parameters.cost < 2 ||
    (parameters.cost & (parameters.cost - 1)) !== 0
  ) {
    throw new RangeError(
      "cost must be a power of two greater than or equal to 2.",
    );
  }

  if (
    !Number.isInteger(parameters.blockSize) ||
    parameters.blockSize <= 0
  ) {
    throw new RangeError(
      "blockSize must be a positive integer.",
    );
  }

  if (
    !Number.isInteger(parameters.parallelization) ||
    parameters.parallelization <= 0
  ) {
    throw new RangeError(
      "parallelization must be a positive integer.",
    );
  }
}

/**
 * Parses a string into a positive safe integer.
 */
export function parsePositiveInteger(
  value: string,
  name: string,
): number {
  if (!/^\d+$/.test(value)) {
    throw new TypeError(
      `${name} must be a positive integer.`,
    );
  }

  const parsed = Number(value);

  if (
    !Number.isSafeInteger(parsed) ||
    parsed <= 0
  ) {
    throw new RangeError(
      `${name} is outside the supported integer range.`,
    );
  }

  return parsed;
}

/**
 * Decodes a Base64URL string into bytes.
 */
export function decodeBase64Url(value: string): Uint8Array {
  if (
    value.length === 0 ||
    !/^[A-Za-z0-9_-]+$/.test(value)
  ) {
    throw new TypeError("Invalid Base64URL value.");
  }

  if (value.length % 4 === 1) {
    throw new TypeError("Invalid Base64URL length.");
  }

  return new Uint8Array(Buffer.from(value, "base64url"));
}

/**
 * Asserts that a value is a non-empty password string.
 */
export function assertPassword(password: string): void {
  if (typeof password !== "string") {
    throw new TypeError("Password must be a string.");
  }

  if (password.length === 0) {
    throw new TypeError("Password cannot be empty.");
  }
}
