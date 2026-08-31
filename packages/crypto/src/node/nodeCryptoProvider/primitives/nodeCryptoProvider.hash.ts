import type { HashAlgorithm, HmacAlgorithm, CryptoInput } from "../../../cryptoProvider/index.js";
import { createHash, createHmac } from "node:crypto";
import { toBytes, nodeHashAlgorithm } from "../nodeCryptoProvider.helper.js";

export async function hash(algorithm: HashAlgorithm, data: CryptoInput): Promise<Uint8Array> {
  const normalized = toBytes(data);
  const hasher = createHash(nodeHashAlgorithm(algorithm));
  hasher.update(normalized);
  return new Uint8Array(hasher.digest());
}

export async function hmac(algorithm: HmacAlgorithm, key: CryptoInput, data: CryptoInput): Promise<Uint8Array> {
  const normalizedKey = toBytes(key);
  const normalizedData = toBytes(data);
  const h = createHmac(nodeHashAlgorithm(algorithm), normalizedKey);
  h.update(normalizedData);
  return new Uint8Array(h.digest());
}
