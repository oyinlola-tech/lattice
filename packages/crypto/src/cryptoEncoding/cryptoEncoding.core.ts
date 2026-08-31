import {
  toHex,
  fromHex,
} from "./encoding/cryptoEncoding.hex.js";

import {
  toBase64,
  fromBase64,
} from "./encoding/cryptoEncoding.base64.js";

import {
  toBase64Url,
  fromBase64Url,
} from "./encoding/cryptoEncoding.base64url.js";

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
      return toHex(value);

    case "base64":
      return toBase64(value);

    case "base64url":
      return toBase64Url(value);

    case "utf8":
      return new TextDecoder()
        .decode(value);

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
      return fromHex(value);

    case "base64":
      return fromBase64(value);

    case "base64url":
      return fromBase64Url(value);

    case "utf8":
      return new TextEncoder()
        .encode(value);

    default:
      throw new TypeError(
        `Unsupported crypto encoding: ${String(
          encoding,
        )}.`,
      );
  }
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

  return new TextEncoder()
    .encode(value);
}

/**
 * Decodes UTF-8 bytes into a string.
 */
export function utf8Decode(
  value: Uint8Array,
): string {
  assertBytes(value);

  return new TextDecoder()
    .decode(value);
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
