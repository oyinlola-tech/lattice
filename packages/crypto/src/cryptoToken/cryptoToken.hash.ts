import { createNodeCryptoProvider } from "../node/index.js";

import { encode } from "../cryptoEncoding/cryptoEncoding.core.js";

import type { CryptoProvider } from "../cryptoProvider/index.js";

let defaultProvider: CryptoProvider | undefined;

/**
 * Returns a lazily created default crypto provider.
 *
 * The provider abstraction keeps token hashing free of direct
 * `node:crypto` usage while still allowing callers to inject their own.
 */
function getDefaultProvider(): CryptoProvider {
  if (defaultProvider === undefined) {
    defaultProvider =
      createNodeCryptoProvider();
  }

  return defaultProvider;
}

/**
 * Creates a deterministic SHA-256 identifier from a token.
 *
 * The returned value does not expose the original token.
 */
export async function hashToken(
  token: string,
): Promise<string> {
  assertToken(token);

  const digest =
    await getDefaultProvider().hash("sha256", token);

  return encode(digest, "hex");
}

/**
 * Creates a Base64URL SHA-256 digest of a token.
 */
export async function hashTokenBase64Url(
  token: string,
): Promise<string> {
  assertToken(token);

  const digest =
    await getDefaultProvider().hash("sha256", token);

  return encode(digest, "base64url");
}

/**
 * Compares a token with a stored hash.
 *
 * Comparison is performed with a constant-time XOR accumulation to
 * avoid timing side-channels.
 */
export async function verifyTokenHash(
  token: string,
  expectedHash: string,
): Promise<boolean> {
  try {
    const actual =
      await hashToken(token);

    if (
      actual.length !==
        expectedHash.length
    ) {
      return false;
    }

    return constantTimeEqual(
      actual,
      expectedHash,
    );
  } catch {
    return false;
  }
}

/**
 * Hashes a token using SHA-256 before storage.
 *
 * This is useful when a raw bearer token must never be persisted.
 */
export async function hashTokenForStorage(
  token: string,
): Promise<string> {
  return hashToken(token);
}

/**
 * Compares two hex-encoded strings in constant time.
 */
function constantTimeEqual(
  left: string,
  right: string,
): boolean {
  let mismatch = 0;

  const length = left.length;

  if (length !== right.length) {
    return false;
  }

  for (
    let i = 0;
    i < length;
    i += 1
  ) {
    mismatch |=
      left.charCodeAt(i) ^
      right.charCodeAt(i);
  }

  return mismatch === 0;
}

/**
 * Validates the basic shape of an opaque token.
 */
function assertToken(
  token: string,
): void {
  if (
    typeof token !==
      "string" ||
    token.length === 0
  ) {
    throw new TypeError(
      "Token must be a non-empty string.",
    );
  }
}
