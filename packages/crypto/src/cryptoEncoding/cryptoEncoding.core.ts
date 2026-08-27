import {
  timingSafeEqual,
} from "node:crypto";

/**
 * Supported binary encodings.
 */
export type CryptoEncoding =
  | "hex"
  | "base64"
  | "base64url"
  | "utf8";

/**
 * Encodes bytes into a string.
 */
export function encode(
  value: Uint8Array,
  encoding: CryptoEncoding = "base64url",
): string {
  assertBytes(value);

  switch (encoding) {
    case "hex":
      return Buffer.from(value).toString(
        "hex",
      );

    case "base64":
      return Buffer.from(value).toString(
        "base64",
      );

    case "base64url":
      return Buffer.from(value).toString(
        "base64url",
      );

    case "utf8":
      return Buffer.from(value).toString(
        "utf8",
      );

    default:
      throw new TypeError(
        `Unsupported crypto encoding: ${String(
          encoding,
        )}.`,
      );
  }
}

/**
 * Decodes a string into bytes.
 */
export function decode(
  value: string,
  encoding: CryptoEncoding = "base64url",
): Uint8Array {
  if (
    typeof value !== "string"
  ) {
    throw new TypeError(
      "Encoded value must be a string.",
    );
  }

  switch (encoding) {
    case "hex":
      return decodeHex(value);

    case "base64":
      return decodeBase64(value);

    case "base64url":
      return decodeBase64Url(value);

    case "utf8":
      return new Uint8Array(
        Buffer.from(
          value,
          "utf8",
        ),
      );

    default:
      throw new TypeError(
        `Unsupported crypto encoding: ${String(
          encoding,
        )}.`,
      );
  }
}

/**
 * Encodes bytes as hexadecimal.
 */
export function toHex(
  value: Uint8Array,
): string {
  return encode(
    value,
    "hex",
  );
}

/**
 * Decodes hexadecimal into bytes.
 */
export function fromHex(
  value: string,
): Uint8Array {
  return decode(
    value,
    "hex",
  );
}

/**
 * Encodes bytes as standard Base64.
 */
export function toBase64(
  value: Uint8Array,
): string {
  return encode(
    value,
    "base64",
  );
}

/**
 * Decodes standard Base64 into bytes.
 */
export function fromBase64(
  value: string,
): Uint8Array {
  return decode(
    value,
    "base64",
  );
}

/**
 * Encodes bytes as URL-safe Base64 without padding.
 */
export function toBase64Url(
  value: Uint8Array,
): string {
  return encode(
    value,
    "base64url",
  );
}

/**
 * Decodes URL-safe Base64 into bytes.
 */
export function fromBase64Url(
  value: string,
): Uint8Array {
  return decode(
    value,
    "base64url",
  );
}

/**
 * Encodes UTF-8 text into bytes.
 */
export function utf8Encode(
  value: string,
): Uint8Array {
  if (
    typeof value !== "string"
  ) {
    throw new TypeError(
      "UTF-8 input must be a string.",
    );
  }

  return new Uint8Array(
    Buffer.from(
      value,
      "utf8",
    ),
  );
}

/**
 * Decodes UTF-8 bytes into a string.
 */
export function utf8Decode(
  value: Uint8Array,
): string {
  assertBytes(value);

  return Buffer.from(
    value,
  ).toString(
    "utf8",
  );
}

/**
 * Compares two encoded values using constant-time comparison.
 *
 * Both values must use the same encoding.
 */
export function timingSafeEqualEncoded(
  left: string,
  right: string,
  encoding: CryptoEncoding = "base64url",
): boolean {
  const leftBytes =
    decode(
      left,
      encoding,
    );

  const rightBytes =
    decode(
      right,
      encoding,
    );

  if (
    leftBytes.byteLength !==
    rightBytes.byteLength
  ) {
    return false;
  }

  return timingSafeEqual(
    Buffer.from(
      leftBytes,
    ),
    Buffer.from(
      rightBytes,
    ),
  );
}

/**
 * Returns whether a string is valid hexadecimal.
 */
export function isHex(
  value: string,
): boolean {
  return (
    typeof value ===
      "string" &&
    value.length % 2 ===
      0 &&
    /^[0-9a-fA-F]*$/.test(
      value,
    )
  );
}

/**
 * Returns whether a string is valid standard Base64.
 */
export function isBase64(
  value: string,
): boolean {
  if (
    typeof value !==
      "string" ||
    value.length % 4 !==
      0
  ) {
    return false;
  }

  return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
    value,
  );
}

/**
 * Returns whether a string is valid URL-safe Base64.
 */
export function isBase64Url(
  value: string,
): boolean {
  if (
    typeof value !==
      "string"
  ) {
    return false;
  }

  return /^(?:[A-Za-z0-9_-]{2,4})*(?:[A-Za-z0-9_-]{2,3})?$/.test(
    value,
  );
}

/**
 * Converts an ArrayBuffer into a defensive Uint8Array copy.
 */
export function arrayBufferToBytes(
  value: ArrayBuffer,
): Uint8Array {
  if (
    !(value instanceof ArrayBuffer)
  ) {
    throw new TypeError(
      "Value must be an ArrayBuffer.",
    );
  }

  return new Uint8Array(
    value.slice(0),
  );
}

/**
 * Converts bytes into an ArrayBuffer copy.
 */
export function bytesToArrayBuffer(
  value: Uint8Array,
): ArrayBuffer {
  assertBytes(value);

  return value.buffer.slice(
    value.byteOffset,
    value.byteOffset +
      value.byteLength,
  ) as ArrayBuffer;
}

function decodeHex(
  value: string,
): Uint8Array {
  if (
    !isHex(value)
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

function decodeBase64(
  value: string,
): Uint8Array {
  if (
    !isBase64(value)
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

function decodeBase64Url(
  value: string,
): Uint8Array {
  if (
    value.length === 0
  ) {
    return new Uint8Array();
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
    value.length % 4 ===
    1
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