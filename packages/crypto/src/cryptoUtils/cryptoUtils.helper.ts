import {
  timingSafeEqual,
} from "node:crypto";

/**
 * Converts supported binary input into a Uint8Array.
 */
export type BinaryInput =
  | Uint8Array
  | ArrayBuffer
  | string;

/**
 * Converts binary input into a defensive Uint8Array copy.
 */
export function toBytes(
  value: BinaryInput,
): Uint8Array {
  if (
    typeof value === "string"
  ) {
    return new Uint8Array(
      Buffer.from(
        value,
        "utf8",
      ),
    );
  }

  if (
    value instanceof Uint8Array
  ) {
    return new Uint8Array(
      value,
    );
  }

  if (
    value instanceof ArrayBuffer
  ) {
    return new Uint8Array(
      value.slice(0),
    );
  }

  throw new TypeError(
    "Value must be a string, Uint8Array, or ArrayBuffer.",
  );
}

/**
 * Converts bytes into a hexadecimal string.
 */
export function bytesToHex(
  value: Uint8Array,
): string {
  assertBytes(value);

  return Buffer.from(
    value,
  ).toString(
    "hex",
  );
}

/**
 * Converts a hexadecimal string into bytes.
 */
export function hexToBytes(
  value: string,
): Uint8Array {
  if (
    typeof value !== "string"
  ) {
    throw new TypeError(
      "Hex value must be a string.",
    );
  }

  if (
    value.length % 2 !== 0 ||
    !/^[0-9a-fA-F]*$/.test(value)
  ) {
    throw new TypeError(
      "Invalid hexadecimal value.",
    );
  }

  return new Uint8Array(
    Buffer.from(
      value,
      "hex",
    ),
  );
}

/**
 * Converts bytes into Base64.
 */
export function bytesToBase64(
  value: Uint8Array,
): string {
  assertBytes(value);

  return Buffer.from(
    value,
  ).toString(
    "base64",
  );
}

/**
 * Converts Base64 into bytes.
 */
export function base64ToBytes(
  value: string,
): Uint8Array {
  if (
    typeof value !== "string"
  ) {
    throw new TypeError(
      "Base64 value must be a string.",
    );
  }

  if (
    value.length % 4 !== 0 ||
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      value,
    )
  ) {
    throw new TypeError(
      "Invalid Base64 value.",
    );
  }

  return new Uint8Array(
    Buffer.from(
      value,
      "base64",
    ),
  );
}

/**
 * Converts bytes into URL-safe Base64 without padding.
 */
export function bytesToBase64Url(
  value: Uint8Array,
): string {
  assertBytes(value);

  return Buffer.from(
    value,
  ).toString(
    "base64url",
  );
}

/**
 * Converts URL-safe Base64 into bytes.
 */
export function base64UrlToBytes(
  value: string,
): Uint8Array {
  if (
    typeof value !== "string"
  ) {
    throw new TypeError(
      "Base64URL value must be a string.",
    );
  }

  if (
    !/^[A-Za-z0-9_-]*$/.test(
      value,
    )
  ) {
    throw new TypeError(
      "Invalid Base64URL value.",
    );
  }

  if (
    value.length % 4 === 1
  ) {
    throw new TypeError(
      "Invalid Base64URL length.",
    );
  }

  return new Uint8Array(
    Buffer.from(
      value,
      "base64url",
    ),
  );
}

/**
 * Compares two byte arrays in constant time.
 *
 * Different lengths return false immediately.
 */
export function secureEqual(
  left: Uint8Array,
  right: Uint8Array,
): boolean {
  assertBytes(left);
  assertBytes(right);

  if (
    left.byteLength !==
    right.byteLength
  ) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(left),
    Buffer.from(right),
  );
}

/**
 * Performs a constant-time comparison of two strings.
 */
export function secureStringEqual(
  left: string,
  right: string,
): boolean {
  if (
    typeof left !== "string" ||
    typeof right !== "string"
  ) {
    return false;
  }

  const leftBytes =
    Buffer.from(
      left,
      "utf8",
    );

  const rightBytes =
    Buffer.from(
      right,
      "utf8",
    );

  if (
    leftBytes.byteLength !==
    rightBytes.byteLength
  ) {
    return false;
  }

  return timingSafeEqual(
    leftBytes,
    rightBytes,
  );
}

/**
 * Clears sensitive byte material from memory where possible.
 */
export function wipe(
  value: Uint8Array,
): void {
  assertBytes(value);

  value.fill(0);
}

/**
 * Creates a defensive copy of byte material.
 */
export function cloneBytes(
  value: Uint8Array,
): Uint8Array {
  assertBytes(value);

  return new Uint8Array(
    value,
  );
}

/**
 * Concatenates multiple byte arrays.
 */
export function concatBytes(
  ...values: readonly Uint8Array[]
): Uint8Array {
  let totalLength = 0;

  for (
    const value of values
  ) {
    assertBytes(value);

    totalLength +=
      value.byteLength;
  }

  const result =
    new Uint8Array(
      totalLength,
    );

  let offset = 0;

  for (
    const value of values
  ) {
    result.set(
      value,
      offset,
    );

    offset +=
      value.byteLength;
  }

  return result;
}

/**
 * Returns a slice of bytes as a defensive copy.
 */
export function sliceBytes(
  value: Uint8Array,
  start?: number,
  end?: number,
): Uint8Array {
  assertBytes(value);

  return new Uint8Array(
    value.slice(
      start,
      end,
    ),
  );
}

/**
 * Returns whether a value is a Uint8Array.
 */
export function isBytes(
  value: unknown,
): value is Uint8Array {
  return (
    value instanceof
    Uint8Array
  );
}

/**
 * Returns whether a value is an ArrayBuffer.
 */
export function isArrayBuffer(
  value: unknown,
): value is ArrayBuffer {
  return (
    value instanceof
    ArrayBuffer
  );
}

/**
 * Returns whether a string contains only hexadecimal characters.
 */
export function isHexString(
  value: string,
): boolean {
  return (
    typeof value === "string" &&
    value.length % 2 === 0 &&
    /^[0-9a-fA-F]*$/.test(value)
  );
}

/**
 * Returns whether a string is a valid Base64URL value.
 */
export function isBase64UrlString(
  value: string,
): boolean {
  return (
    typeof value === "string" &&
    value.length % 4 !== 1 &&
    /^[A-Za-z0-9_-]*$/.test(value)
  );
}

/**
 * Converts a number into an unsigned big-endian byte array.
 */
export function numberToBytes(
  value: number,
  byteLength = 8,
): Uint8Array {
  if (
    !Number.isSafeInteger(value) ||
    value < 0
  ) {
    throw new RangeError(
      "value must be a non-negative safe integer.",
    );
  }

  if (
    !Number.isInteger(byteLength) ||
    byteLength <= 0 ||
    byteLength > 6
  ) {
    throw new RangeError(
      "byteLength must be an integer between 1 and 6.",
    );
  }

  const result =
    new Uint8Array(
      byteLength,
    );

  let remaining =
    value;

  for (
    let index =
      byteLength - 1;
    index >= 0;
    index -= 1
  ) {
    result[index] =
      remaining & 0xff;

    remaining =
      Math.floor(
        remaining / 256,
      );
  }

  if (
    remaining !== 0
  ) {
    throw new RangeError(
      "value does not fit within the requested byte length.",
    );
  }

  return result;
}

/**
 * Converts unsigned big-endian bytes into a number.
 */
export function bytesToNumber(
  value: Uint8Array,
): number {
  assertBytes(value);

  if (
    value.byteLength === 0 ||
    value.byteLength > 6
  ) {
    throw new RangeError(
      "Byte array length must be between 1 and 6.",
    );
  }

  let result = 0;

  for (
    const byte of value
  ) {
    result =
      result * 256 +
      byte;
  }

  return result;
}

/**
 * Normalizes a string before cryptographic processing.
 *
 * This only performs Unicode normalization. It does not trim
 * whitespace because whitespace may be meaningful in passwords
 * and other security-sensitive values.
 */
export function normalizeText(
  value: string,
): string {
  if (
    typeof value !== "string"
  ) {
    throw new TypeError(
      "Value must be a string.",
    );
  }

  return value.normalize(
    "NFC",
  );
}

/**
 * Returns the UTF-8 byte length of a string.
 */
export function utf8ByteLength(
  value: string,
): number {
  if (
    typeof value !== "string"
  ) {
    throw new TypeError(
      "Value must be a string.",
    );
  }

  return Buffer.byteLength(
    value,
    "utf8",
  );
}

function assertBytes(
  value: Uint8Array,
): void {
  if (
    !(value instanceof Uint8Array)
  ) {
    throw new TypeError(
      "Value must be a Uint8Array.",
    );
  }
}