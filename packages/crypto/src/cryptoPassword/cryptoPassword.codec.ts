import { CryptoAlgorithm } from "../cryptoConstants/cryptoConstants.type.js";

import type { PasswordHashParameters } from "./cryptoPassword.type.js";

import {
  decodeBase64Url,
  parsePositiveInteger,
  validateParameters,
} from "./cryptoPassword.validate.js";

/**
 * Current password hash encoding format version.
 */
export const PASSWORD_FORMAT_VERSION = "v1";

/**
 * Decodes an encoded password hash into its parameters.
 */
export function decodePasswordHash(
  encoded: string,
): PasswordHashParameters {
  if (typeof encoded !== "string" || encoded.length === 0) {
    throw new TypeError("Password hash must be a non-empty string.");
  }

  const parts = encoded.split("$");

  if (parts.length !== 6) {
    throw new TypeError("Invalid password hash format.");
  }

  const [
    version,
    algorithm,
    costPart,
    blockSizePart,
    parallelizationPart,
    payload,
  ] = parts as [string, string, string, string, string, string];

  if (version !== PASSWORD_FORMAT_VERSION) {
    throw new TypeError(
      `Unsupported password hash version: ${version}.`,
    );
  }

  if (algorithm !== CryptoAlgorithm.SCRYPT) {
    throw new TypeError(
      `Unsupported password hash algorithm: ${algorithm}.`,
    );
  }

  const cost = parsePositiveInteger(costPart, "cost");
  const blockSize = parsePositiveInteger(blockSizePart, "blockSize");
  const parallelization = parsePositiveInteger(
    parallelizationPart,
    "parallelization",
  );

  const payloadParts = payload.split(".");

  if (payloadParts.length !== 2) {
    throw new TypeError("Invalid password hash payload.");
  }

  const [encodedSalt, encodedHash] = payloadParts as [
    string,
    string,
  ];

  const salt = decodeBase64Url(encodedSalt);
  const hash = decodeBase64Url(encodedHash);

  if (salt.byteLength === 0) {
    throw new TypeError("Password hash salt cannot be empty.");
  }

  if (hash.byteLength === 0) {
    throw new TypeError("Password hash cannot be empty.");
  }

  validateParameters({
    saltBytes: salt.byteLength,
    keyBytes: hash.byteLength,
    cost,
    blockSize,
    parallelization,
  });

  return Object.freeze({
    version,
    algorithm: CryptoAlgorithm.SCRYPT,
    salt,
    hash,
    cost,
    blockSize,
    parallelization,
  });
}

/**
 * Encodes password hashing parameters into a portable string.
 */
export function encodePasswordHash(
  parameters: PasswordHashParameters,
): string {
  if (parameters.algorithm !== CryptoAlgorithm.SCRYPT) {
    throw new TypeError(
      "Only scrypt password hashes are supported.",
    );
  }

  validateParameters({
    saltBytes: parameters.salt.byteLength,
    keyBytes: parameters.hash.byteLength,
    cost: parameters.cost,
    blockSize: parameters.blockSize,
    parallelization: parameters.parallelization,
  });

  if (parameters.version !== PASSWORD_FORMAT_VERSION) {
    throw new TypeError(
      `Unsupported password hash version: ${parameters.version}.`,
    );
  }

  return [
    parameters.version,
    parameters.algorithm,
    parameters.cost,
    parameters.blockSize,
    parameters.parallelization,
    [
      Buffer.from(parameters.salt).toString("base64url"),
      Buffer.from(parameters.hash).toString("base64url"),
    ].join("."),
  ].join("$");
}
