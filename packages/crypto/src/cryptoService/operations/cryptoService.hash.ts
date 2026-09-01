import {
  createNodeCryptoProvider,
} from "../../node/index.js";

import {
  encode,
} from "../../cryptoEncoding/cryptoEncoding.core.js";

import {
  cryptoHashError,
} from "@oyinlola141/lattice-errors";

const provider = createNodeCryptoProvider();

export async function serviceHash(
  value: string | Uint8Array,
): Promise<Uint8Array> {
  try {
    return await provider.hash("sha256", value);
  } catch {
    throw cryptoHashError("Hashing failed.", "sha256");
  }
}

export async function serviceHashHex(
  value: string | Uint8Array,
): Promise<string> {
  return encode(await serviceHash(value), "hex");
}
