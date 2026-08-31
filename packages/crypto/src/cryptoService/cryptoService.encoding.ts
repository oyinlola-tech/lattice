import type {
  CryptoEncoding,
} from "../cryptoEncoding/cryptoEncoding.core.js";

import {
  encode,
  decode,
} from "../cryptoEncoding/cryptoEncoding.core.js";

import {
  createCryptoError,
} from "@lattice/errors";

export type { CryptoEncoding };

export function serviceEncode(
  value: Uint8Array,
  encoding: CryptoEncoding = "base64url",
): string {
  try {
    return encode(value, encoding);
  } catch {
    throw createCryptoError(
      "Crypto encoding failed.",
      {},
    );
  }
}

export function serviceDecode(
  value: string,
  encoding: CryptoEncoding = "base64url",
): Uint8Array {
  try {
    return decode(value, encoding);
  } catch {
    throw createCryptoError(
      "Crypto decoding failed.",
      {},
    );
  }
}
