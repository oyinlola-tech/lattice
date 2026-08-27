import {
  createPrivateKey,
  createPublicKey,
  createSign,
  createVerify,
  type KeyObject,
} from "node:crypto";

import type {
  CryptoKey,
} from "../cryptoKey/cryptoKey.type.js";

import {
  CryptoAlgorithm,
} from "../cryptoAlgorithm/cryptoAlgorithm.type.js";

/**
 * Supported signature algorithms.
 */
export type SignatureAlgorithm =
  | "ed25519"
  | "rsa-sha256"
  | "rsa-sha384"
  | "rsa-sha512"
  | "ecdsa-sha256"
  | "ecdsa-sha384"
  | "ecdsa-sha512";

/**
 * Options used when creating a signature.
 */
export interface SignatureOptions {
  readonly algorithm?: SignatureAlgorithm;
}

/**
 * Signs arbitrary data using a private key.
 */
export function sign(
  data: Uint8Array,
  privateKey: KeyObject | string | Uint8Array,
  options: SignatureOptions = {},
): Uint8Array {
  const algorithm =
    options.algorithm ??
    "ed25519";

  const key =
    toPrivateKey(
      privateKey,
    );

  if (
    algorithm === "ed25519"
  ) {
    const signature =
      createSign("null")
        .update(
          Buffer.from(data),
        )
        .sign(key);

    return new Uint8Array(
      signature,
    );
  }

  const signer =
    createSign(
      nodeSignatureAlgorithm(
        algorithm,
      ),
    );

  signer.update(
    Buffer.from(data),
  );

  signer.end();

  return new Uint8Array(
    signer.sign(key),
  );
}

/**
 * Verifies a signature using a public key.
 */
export function verify(
  data: Uint8Array,
  signature: Uint8Array,
  publicKey: KeyObject | string | Uint8Array,
  options: SignatureOptions = {},
): boolean {
  try {
    const algorithm =
      options.algorithm ??
      "ed25519";

    const key =
      toPublicKey(
        publicKey,
      );

    if (
      algorithm === "ed25519"
    ) {
      const verifier =
        createVerify("null");

      verifier.update(
        Buffer.from(data),
      );

      verifier.end();

      return verifier.verify(
        key,
        Buffer.from(
          signature,
        ),
      );
    }

    const verifier =
      createVerify(
        nodeSignatureAlgorithm(
          algorithm,
        ),
      );

    verifier.update(
      Buffer.from(data),
    );

    verifier.end();

    return verifier.verify(
      key,
      Buffer.from(
        signature,
      ),
    );
  } catch {
    return false;
  }
}

/**
 * Signs UTF-8 text.
 */
export function signString(
  data: string,
  privateKey: KeyObject | string | Uint8Array,
  options: SignatureOptions = {},
): Uint8Array {
  return sign(
    Buffer.from(
      data,
      "utf8",
    ),
    privateKey,
    options,
  );
}

/**
 * Verifies a signature against UTF-8 text.
 */
export function verifyString(
  data: string,
  signature: Uint8Array,
  publicKey: KeyObject | string | Uint8Array,
  options: SignatureOptions = {},
): boolean {
  return verify(
    Buffer.from(
      data,
      "utf8",
    ),
    signature,
    publicKey,
    options,
  );
}

/**
 * Generates an Ed25519 key pair.
 */
export function generateEd25519KeyPair(): {
  readonly privateKey: KeyObject;
  readonly publicKey: KeyObject;
} {
  const {
    generateKeyPairSync,
  } =
    requireNodeCrypto();

  const {
    privateKey,
    publicKey,
  } =
    generateKeyPairSync(
      "ed25519",
    );

  return Object.freeze({
    privateKey,
    publicKey,
  });
}

/**
 * Exports a private key as PEM.
 */
export function exportPrivateKeyPem(
  privateKey: KeyObject,
): string {
  assertKeyObject(
    privateKey,
  );

  return privateKey.export({
    type: "pkcs8",
    format: "pem",
  }).toString();
}

/**
 * Exports a public key as PEM.
 */
export function exportPublicKeyPem(
  publicKey: KeyObject,
): string {
  assertKeyObject(
    publicKey,
  );

  return publicKey.export({
    type: "spki",
    format: "pem",
  }).toString();
}

/**
 * Creates a public key from a private key.
 */
export function derivePublicKey(
  privateKey: KeyObject | string | Uint8Array,
): KeyObject {
  return createPublicKey(
    toPrivateKey(
      privateKey,
    ),
  );
}

/**
 * Converts a CryptoKey into a Node.js KeyObject.
 *
 * This helper currently supports key material represented as PEM,
 * DER, or other Node-supported key encodings.
 */
export function cryptoKeyToPrivateKey(
  key: CryptoKey,
): KeyObject {
  if (
    key.algorithm !==
    CryptoAlgorithm.ED25519
  ) {
    throw new TypeError(
      `CryptoKey algorithm "${key.algorithm}" is not supported for Ed25519 signatures.`,
    );
  }

  if (
    !key.extractable
  ) {
    throw new Error(
      `Cryptographic key "${key.keyId}" is not extractable.`,
    );
  }

  return createPrivateKey({
    key: Buffer.from(
      key.bytes(),
    ),
    format: "der",
    type: "pkcs8",
  });
}

function toPrivateKey(
  key: KeyObject | string | Uint8Array,
): KeyObject {
  if (
    isKeyObject(key)
  ) {
    return key;
  }

  if (
    typeof key === "string"
  ) {
    return createPrivateKey(
      key,
    );
  }

  if (
    key instanceof Uint8Array
  ) {
    return createPrivateKey({
      key: Buffer.from(
        key,
      ),
      format: "der",
      type: "pkcs8",
    });
  }

  throw new TypeError(
    "Invalid private key.",
  );
}

function toPublicKey(
  key: KeyObject | string | Uint8Array,
): KeyObject {
  if (
    isKeyObject(key)
  ) {
    return key;
  }

  if (
    typeof key === "string"
  ) {
    return createPublicKey(
      key,
    );
  }

  if (
    key instanceof Uint8Array
  ) {
    return createPublicKey({
      key: Buffer.from(
        key,
      ),
      format: "der",
      type: "spki",
    });
  }

  throw new TypeError(
    "Invalid public key.",
  );
}

function nodeSignatureAlgorithm(
  algorithm: SignatureAlgorithm,
): string {
  switch (
    algorithm
  ) {
    case "rsa-sha256":
      return "RSA-SHA256";

    case "rsa-sha384":
      return "RSA-SHA384";

    case "rsa-sha512":
      return "RSA-SHA512";

    case "ecdsa-sha256":
      return "SHA256";

    case "ecdsa-sha384":
      return "SHA384";

    case "ecdsa-sha512":
      return "SHA512";

    case "ed25519":
      throw new TypeError(
        "Ed25519 does not use a digest algorithm.",
      );

    default:
      throw new TypeError(
        `Unsupported signature algorithm: ${String(
          algorithm,
        )}.`,
      );
  }
}

function isKeyObject(
  value: unknown,
): value is KeyObject {
  return (
    typeof value === "object" &&
    value !== null &&
    "type" in value &&
    "export" in value
  );
}

function assertKeyObject(
  key: KeyObject,
): void {
  if (
    !isKeyObject(key)
  ) {
    throw new TypeError(
      "Expected a Node.js KeyObject.",
    );
  }
}

function requireNodeCrypto(): typeof import("node:crypto") {
  return require("node:crypto") as typeof import("node:crypto");
}

declare const require: NodeRequire;

interface NodeRequire {
  (
    moduleName: string,
  ): unknown;
}