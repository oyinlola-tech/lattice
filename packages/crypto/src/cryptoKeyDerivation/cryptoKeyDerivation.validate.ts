/**
 * Validates PBKDF2 key derivation options.
 */
export function validatePbkdf2Options(
  iterations: number,
  keyLength: number,
  salt: Uint8Array,
): void {
  if (!Number.isInteger(iterations) || iterations < 100_000) {
    throw new RangeError(
      "PBKDF2 iterations must be at least 100000.",
    );
  }

  if (!Number.isInteger(keyLength) || keyLength < 16) {
    throw new RangeError(
      "PBKDF2 keyLength must be at least 16 bytes.",
    );
  }

  if (salt.byteLength < 16) {
    throw new RangeError(
      "PBKDF2 salt must be at least 16 bytes.",
    );
  }
}

/**
 * Validates scrypt key derivation options.
 */
export function validateScryptOptions(
  keyLength: number,
  cost: number,
  blockSize: number,
  parallelization: number,
  salt: Uint8Array,
): void {
  if (!Number.isInteger(keyLength) || keyLength < 16) {
    throw new RangeError(
      "scrypt keyLength must be at least 16 bytes.",
    );
  }

  if (
    !Number.isInteger(cost) ||
    cost < 2 ||
    (cost & (cost - 1)) !== 0
  ) {
    throw new RangeError(
      "scrypt cost must be a power of two greater than or equal to 2.",
    );
  }

  if (!Number.isInteger(blockSize) || blockSize <= 0) {
    throw new RangeError(
      "scrypt blockSize must be a positive integer.",
    );
  }

  if (
    !Number.isInteger(parallelization) ||
    parallelization <= 0
  ) {
    throw new RangeError(
      "scrypt parallelization must be a positive integer.",
    );
  }

  if (salt.byteLength < 16) {
    throw new RangeError(
      "scrypt salt must be at least 16 bytes.",
    );
  }
}
