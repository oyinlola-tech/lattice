import {
  randomBytes,
  randomInt,
  randomUUID,
} from "node:crypto";

/**
 * Generates cryptographically secure random bytes.
 */
export function randomBytesSecure(
  length: number,
): Uint8Array {
  assertPositiveInteger(
    length,
    "length",
  );

  return new Uint8Array(
    randomBytes(length),
  );
}

/**
 * Generates a cryptographically secure random hexadecimal string.
 */
export function randomHex(
  length: number,
): string {
  assertPositiveInteger(
    length,
    "length",
  );

  return randomBytes(
    Math.ceil(length / 2),
  )
    .toString("hex")
    .slice(0, length);
}

/**
 * Generates a cryptographically secure random base64 string.
 */
export function randomBase64(
  byteLength: number,
): string {
  assertPositiveInteger(
    byteLength,
    "byteLength",
  );

  return randomBytes(
    byteLength,
  ).toString("base64");
}

/**
 * Generates a cryptographically secure URL-safe random string.
 */
export function randomBase64Url(
  byteLength: number,
): string {
  assertPositiveInteger(
    byteLength,
    "byteLength",
  );

  return randomBytes(
    byteLength,
  ).toString("base64url");
}

/**
 * Generates a cryptographically secure random integer.
 *
 * The returned value is in the range:
 * min <= value < max
 */
export function randomInteger(
  min: number,
  max: number,
): number {
  assertInteger(
    min,
    "min",
  );

  assertInteger(
    max,
    "max",
  );

  if (
    max <= min
  ) {
    throw new RangeError(
      "max must be greater than min.",
    );
  }

  return randomInt(
    min,
    max,
  );
}

/**
 * Generates a cryptographically secure random integer
 * from zero up to, but excluding, max.
 */
export function randomIntegerBelow(
  max: number,
): number {
  assertPositiveInteger(
    max,
    "max",
  );

  return randomInt(
    max,
  );
}

/**
 * Generates a random UUID v4.
 */
export function randomUuid(): string {
  return randomUUID();
}

/**
 * Generates a random token suitable for use as an opaque identifier.
 *
 * The returned token contains only URL-safe characters.
 */
export function randomToken(
  byteLength = 32,
): string {
  return randomBase64Url(
    byteLength,
  );
}

/**
 * Generates a random numeric code.
 *
 * Leading zeroes are preserved.
 */
export function randomNumericCode(
  length = 6,
): string {
  assertPositiveInteger(
    length,
    "length",
  );

  let result = "";

  while (
    result.length < length
  ) {
    const value =
      randomInt(0, 1_000_000);

    result += String(
      value,
    ).padStart(
      6,
      "0",
    );
  }

  return result.slice(
    0,
    length,
  );
}

/**
 * Generates a random alphanumeric token.
 */
export function randomAlphanumeric(
  length: number,
): string {
  assertPositiveInteger(
    length,
    "length",
  );

  const alphabet =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  let result = "";

  while (
    result.length < length
  ) {
    const index =
      randomInt(
        alphabet.length,
      );

    result += alphabet[index];
  }

  return result;
}

/**
 * Generates random characters from a caller-provided alphabet.
 *
 * The alphabet must not be empty.
 */
export function randomFromAlphabet(
  length: number,
  alphabet: string,
): string {
  assertPositiveInteger(
    length,
    "length",
  );

  if (
    alphabet.length === 0
  ) {
    throw new RangeError(
      "alphabet must not be empty.",
    );
  }

  const characters =
    Array.from(
      alphabet,
    );

  let result = "";

  while (
    result.length < length
  ) {
    const index =
      randomInt(
        characters.length,
      );

    result += characters[index];
  }

  return result;
}

/**
 * Generates a cryptographically secure random boolean.
 */
export function randomBoolean(): boolean {
  return (
    randomInt(0, 2) ===
    1
  );
}

/**
 * Generates a random value from a collection.
 */
export function randomChoice<T>(
  values: readonly T[],
): T {
  if (
    values.length === 0
  ) {
    throw new RangeError(
      "Cannot choose from an empty collection.",
    );
  }

  return values[randomInt(values.length)]!;
}

/**
 * Fills an existing Uint8Array with cryptographically secure
 * random bytes.
 */
export function fillRandomBytes(
  target: Uint8Array,
): Uint8Array {
  if (
    !(target instanceof Uint8Array)
  ) {
    throw new TypeError(
      "target must be a Uint8Array.",
    );
  }

  target.set(
    randomBytes(
      target.byteLength,
    ),
  );

  return target;
}

function assertPositiveInteger(
  value: number,
  name: string,
): void {
  if (
    !Number.isInteger(value) ||
    value <= 0
  ) {
    throw new RangeError(
      `${name} must be a positive integer.`,
    );
  }
}

function assertInteger(
  value: number,
  name: string,
): void {
  if (
    !Number.isInteger(value)
  ) {
    throw new TypeError(
      `${name} must be an integer.`,
    );
  }
}