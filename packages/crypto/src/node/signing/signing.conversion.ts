import type { CryptoKey } from "../../cryptoKey/cryptoKey.type.js";
import { createPrivateKey, createPublicKey, type KeyObject } from "node:crypto";

import { isKeyObject } from "./signing.utils.js";

/**
 * Converts a CryptoKey into a Node.js KeyObject.
 */
export function cryptoKeyToPrivateKey(key: CryptoKey): KeyObject {
  if (key.algorithm !== "ed25519") {
    throw new TypeError(
      `CryptoKey algorithm "${key.algorithm}" is not supported for Ed25519 signatures.`,
    );
  }

  if (!key.extractable) {
    throw new Error(`Cryptographic key "${key.keyId}" is not extractable.`);
  }

  return createPrivateKey({
    key: Buffer.from(key.bytes()),
    format: "der",
    type: "pkcs8",
  });
}

export function toPrivateKey(key: KeyObject | string | Uint8Array): KeyObject {
  if (isKeyObject(key)) {
    return key;
  }

  if (typeof key === "string") {
    return createPrivateKey(key);
  }

  if (key instanceof Uint8Array) {
    return createPrivateKey({
      key: Buffer.from(key),
      format: "der",
      type: "pkcs8",
    });
  }

  throw new TypeError("Invalid private key.");
}

export function toPublicKey(key: KeyObject | string | Uint8Array): KeyObject {
  if (isKeyObject(key)) {
    return key;
  }

  if (typeof key === "string") {
    return createPublicKey(key);
  }

  if (key instanceof Uint8Array) {
    return createPublicKey({
      key: Buffer.from(key),
      format: "der",
      type: "spki",
    });
  }

  throw new TypeError("Invalid public key.");
}
