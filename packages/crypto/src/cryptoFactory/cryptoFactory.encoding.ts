import type {
  CryptoEncoding,
} from "../cryptoEncoding/cryptoEncoding.core.js";

import {
  encode,
  decode,
} from "../cryptoEncoding/cryptoEncoding.core.js";

export type { CryptoEncoding };

export function factoryEncode(
  value: Uint8Array,
  encoding: CryptoEncoding = "base64url",
): string {
  return encode(
    value,
    encoding,
  );
}

export function factoryDecode(
  value: string,
  encoding: CryptoEncoding = "base64url",
): Uint8Array {
  return decode(
    value,
    encoding,
  );
}
