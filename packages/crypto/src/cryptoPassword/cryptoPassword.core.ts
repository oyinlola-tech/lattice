import { createNodeCryptoProvider } from "../node/index.js";

import { CryptoAlgorithm } from "../cryptoConstants/cryptoConstants.type.js";

import type {
  PasswordHashOptions,
  PasswordHashResult,
} from "./cryptoPassword.type.js";

import {
  assertPassword,
  validateParameters,
} from "./cryptoPassword.validate.js";

import {
  decodePasswordHash,
  PASSWORD_FORMAT_VERSION,
} from "./cryptoPassword.codec.js";

const provider = createNodeCryptoProvider();

/**
 * Hashes a password using the configured algorithm.
 */
export async function hashPassword(
  password: string,
  options: PasswordHashOptions = {},
): Promise<PasswordHashResult> {
  assertPassword(password);

  const algorithm =
    options.cost !== undefined ||
    options.blockSize !== undefined ||
    options.parallelization !== undefined
      ? "scrypt"
      : "scrypt";

  const saltBytes = options.saltBytes ?? 16;
  const keyBytes = options.keyBytes ?? 32;
  const cost = options.cost ?? 16_384;
  const blockSize = options.blockSize ?? 8;
  const parallelization = options.parallelization ?? 1;

  validateParameters({
    saltBytes,
    keyBytes,
    cost,
    blockSize,
    parallelization,
  });

  const salt = new Uint8Array(
    await provider.randomBytes(saltBytes),
  );

  const encoded = await provider.hashPassword(password, {
    algorithm: "scrypt",
    memoryCost: cost,
    blockSize,
    parallelism: parallelization,
  });

  const hash = decodePasswordHash(encoded).hash;

  return Object.freeze({
    algorithm: CryptoAlgorithm.SCRYPT,
    version: PASSWORD_FORMAT_VERSION,
    salt,
    hash,
    encoded,
    cost,
    blockSize,
    parallelization,
  });
}

/**
 * Verifies a password against an encoded password hash.
 */
export async function verifyPassword(
  password: string,
  encoded: string,
): Promise<boolean> {
  try {
    assertPassword(password);

    return provider.verifyPassword(password, encoded);
  } catch {
    return false;
  }
}
