import {
  createHash,
  createHmac,
} from "node:crypto";

import type {
  CryptoAlgorithm,
} from "../cryptoAlgorithm/cryptoAlgorithm.type.js";

import {
  CryptoAlgorithm as Algorithm,
} from "../cryptoAlgorithm/cryptoAlgorithm.type.js";

/**
 * Supported hash output encodings.
 */
export type HashEncoding =
  | "hex"
  | "base64"
  | "base64url";

/**
 * Options for hashing data.
 */
export interface HashOptions {
  readonly algorithm?: CryptoAlgorithm;
  readonly encoding?: HashEncoding;
}

/**
 * Result returned by a hash operation.
 */
export interface HashResult {
  readonly algorithm: CryptoAlgorithm;
  readonly digest: Uint8Array;
  readonly encoded: string;
}

/**
 * Converts supported input data into bytes.
 */
export type HashInput =
  | string
  | Uint8Array
  | ArrayBuffer;

/**
 * Hashes arbitrary data using a cryptographic hash algorithm.
 */
export function hash(
  input: HashInput,
  options: HashOptions = {},
): HashResult {
  const algorithm =
    options.algorithm ??
    Algorithm.SHA_256;

  assertHashAlgorithm(
    algorithm,
  );

  const digest =
    createHash(
      nodeHashAlgorithm(
        algorithm,
      ),
    )
      .update(
        toBuffer(input),
      )
      .digest();

  const bytes =
    new Uint8Array(
      digest,
    );

  const encoding =
    options.encoding ??
    "hex";

  return Object.freeze({
    algorithm,
    digest:
      new Uint8Array(
        bytes,
      ),
    encoded:
      encodeDigest(
        bytes,
        encoding,
      ),
  });
}

/**
 * Calculates a SHA-256 digest.
 */
export function sha256(
  input: HashInput,
  encoding: HashEncoding = "hex",
): string {
  return hash(
    input,
    {
      algorithm:
        Algorithm.SHA_256,
      encoding,
    },
  ).encoded;
}

/**
 * Calculates a SHA-384 digest.
 */
export function sha384(
  input: HashInput,
  encoding: HashEncoding = "hex",
): string {
  return hash(
    input,
    {
      algorithm:
        Algorithm.SHA_384,
      encoding,
    },
  ).encoded;
}

/**
 * Calculates a SHA-512 digest.
 */
export function sha512(
  input: HashInput,
  encoding: HashEncoding = "hex",
): string {
  return hash(
    input,
    {
      algorithm:
        Algorithm.SHA_512,
      encoding,
    },
  ).encoded;
}

/**
 * Calculates a SHA3-256 digest.
 */
export function sha3_256(
  input: HashInput,
  encoding: HashEncoding = "hex",
): string {
  return hash(
    input,
    {
      algorithm:
        Algorithm.SHA3_256,
      encoding,
    },
  ).encoded;
}

/**
 * Calculates a SHA3-384 digest.
 */
export function sha3_384(
  input: HashInput,
  encoding: HashEncoding = "hex",
): string {
  return hash(
    input,
    {
      algorithm:
        Algorithm.SHA3_384,
      encoding,
    },
  ).encoded;
}

/**
 * Calculates a SHA3-512 digest.
 */
export function sha3_512(
  input: HashInput,
  encoding: HashEncoding = "hex",
): string {
  return hash(
    input,
    {
      algorithm:
        Algorithm.SHA3_512,
      encoding,
    },
  ).encoded;
}

/**
 * Calculates a keyed HMAC.
 */
export function hmac(
  input: HashInput,
  key: Uint8Array,
  algorithm:
    | CryptoAlgorithm
    = Algorithm.HMAC_SHA256,
  encoding: HashEncoding = "hex",
): string {
  assertHmacAlgorithm(
    algorithm,
  );

  const digest =
    createHmac(
      nodeHashAlgorithm(
        algorithm,
      ),
      toBuffer(key),
    )
      .update(
        toBuffer(input),
      )
      .digest();

  return encodeDigest(
    new Uint8Array(
      digest,
    ),
    encoding,
  );
}

/**
 * Calculates a SHA-256 HMAC.
 */
export function hmacSha256(
  input: HashInput,
  key: Uint8Array,
  encoding: HashEncoding = "hex",
): string {
  return hmac(
    input,
    key,
    Algorithm.HMAC_SHA256,
    encoding,
  );
}

/**
 * Calculates a SHA-384 HMAC.
 */
export function hmacSha384(
  input: HashInput,
  key: Uint8Array,
  encoding: HashEncoding = "hex",
): string {
  return hmac(
    input,
    key,
    Algorithm.HMAC_SHA384,
    encoding,
  );
}

/**
 * Calculates a SHA-512 HMAC.
 */
export function hmacSha512(
  input: HashInput,
  key: Uint8Array,
  encoding: HashEncoding = "hex",
): string {
  return hmac(
    input,
    key,
    Algorithm.HMAC_SHA512,
    encoding,
  );
}

/**
 * Performs a constant-time comparison of two digest strings.
 *
 * This helper is intended for non-secret comparison values such as
 * signatures or hashes after they have been decoded into equal-sized
 * byte arrays.
 */
export function equalDigests(
  left: Uint8Array,
  right: Uint8Array,
): boolean {
  if (
    left.byteLength !==
    right.byteLength
  ) {
    return false;
  }

  let difference = 0;

  for (
    let index = 0;
    index < left.byteLength;
    index += 1
  ) {
    difference |=
      left[index]! ^
      right[index]!;
  }

  return difference === 0;
}

/**
 * Converts a hash result into its encoded representation.
 */
export function encodeDigest(
  digest: Uint8Array,
  encoding: HashEncoding,
): string {
  const buffer =
    Buffer.from(digest);

  switch (
    encoding
  ) {
    case "hex":
      return buffer.toString(
        "hex",
      );

    case "base64":
      return buffer.toString(
        "base64",
      );

    case "base64url":
      return buffer.toString(
        "base64url",
      );

    default:
      throw new TypeError(
        `Unsupported hash encoding: ${String(
          encoding,
        )}.`,
      );
  }
}

/**
 * Decodes a hash string into bytes.
 */
export function decodeDigest(
  digest: string,
  encoding: HashEncoding = "hex",
): Uint8Array {
  if (
    typeof digest !==
      "string" ||
    digest.length === 0
  ) {
    throw new TypeError(
      "Digest must be a non-empty string.",
    );
  }

  switch (
    encoding
  ) {
    case "hex": {
      if (
        !/^[0-9a-fA-F]+$/.test(
          digest,
        ) ||
        digest.length % 2 !==
          0
      ) {
        throw new TypeError(
          "Invalid hexadecimal digest.",
        );
      }

      return new Uint8Array(
        Buffer.from(
          digest,
          "hex",
        ),
      );
    }

    case "base64":
      return new Uint8Array(
        Buffer.from(
          digest,
          "base64",
        ),
      );

    case "base64url":
      return new Uint8Array(
        Buffer.from(
          digest,
          "base64url",
        ),
      );

    default:
      throw new TypeError(
        `Unsupported hash encoding: ${String(
          encoding,
        )}.`,
      );
  }
}

function assertHashAlgorithm(
  algorithm: CryptoAlgorithm,
): void {
  switch (
    algorithm
  ) {
    case Algorithm.SHA_256:
    case Algorithm.SHA_384:
    case Algorithm.SHA_512:
    case Algorithm.SHA3_256:
    case Algorithm.SHA3_384:
    case Algorithm.SHA3_512:
      return;

    default:
      throw new TypeError(
        `Algorithm "${algorithm}" is not a supported hash algorithm.`,
      );
  }
}

function assertHmacAlgorithm(
  algorithm: CryptoAlgorithm,
): void {
  switch (
    algorithm
  ) {
    case Algorithm.HMAC_SHA256:
    case Algorithm.HMAC_SHA384:
    case Algorithm.HMAC_SHA512:
      return;

    default:
      throw new TypeError(
        `Algorithm "${algorithm}" is not a supported HMAC algorithm.`,
      );
  }
}

function nodeHashAlgorithm(
  algorithm: CryptoAlgorithm,
): string {
  switch (
    algorithm
  ) {
    case Algorithm.HMAC_SHA256:
      return "sha256";

    case Algorithm.HMAC_SHA384:
      return "sha384";

    case Algorithm.HMAC_SHA512:
      return "sha512";

    case Algorithm.SHA_256:
      return "sha256";

    case Algorithm.SHA_384:
      return "sha384";

    case Algorithm.SHA_512:
      return "sha512";

    case Algorithm.SHA3_256:
      return "sha3-256";

    case Algorithm.SHA3_384:
      return "sha3-384";

    case Algorithm.SHA3_512:
      return "sha3-512";

    default:
      throw new TypeError(
        `Algorithm "${algorithm}" cannot be used as a hash.`,
      );
  }
}

function toBuffer(
  input: HashInput,
): Buffer {
  if (
    typeof input ===
      "string"
  ) {
    return Buffer.from(
      input,
      "utf8",
    );
  }

  if (
    input instanceof Uint8Array
  ) {
    return Buffer.from(
      input,
    );
  }

  if (
    input instanceof ArrayBuffer
  ) {
    return Buffer.from(
      new Uint8Array(
        input,
      ),
    );
  }

  throw new TypeError(
    "Hash input must be a string, Uint8Array, or ArrayBuffer.",
  );
}