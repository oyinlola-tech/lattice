import {
  randomBytes,
  scrypt as nodeScrypt,
  timingSafeEqual,
} from "node:crypto";

import {
  promisify,
} from "node:util";

import {
  CryptoAlgorithm,
} from "./crypto-algorithm";

const scrypt =
  promisify(nodeScrypt);

const PASSWORD_FORMAT_VERSION =
  "v1";

const DEFAULT_SALT_BYTES = 16;

const DEFAULT_KEY_BYTES = 32;

const DEFAULT_SCRYPT_N = 16_384;

const DEFAULT_SCRYPT_R = 8;

const DEFAULT_SCRYPT_P = 1;

/**
 * Options used for password hashing.
 */
export interface PasswordHashOptions {
  readonly saltBytes?: number;
  readonly keyBytes?: number;
  readonly cost?: number;
  readonly blockSize?: number;
  readonly parallelization?: number;
}

/**
 * Result returned by password hashing.
 */
export interface PasswordHashResult {
  readonly algorithm: CryptoAlgorithm;
  readonly version: string;
  readonly salt: Uint8Array;
  readonly hash: Uint8Array;
  readonly encoded: string;
  readonly cost: number;
  readonly blockSize: number;
  readonly parallelization: number;
}

/**
 * Parameters encoded into a password hash.
 */
export interface PasswordHashParameters {
  readonly version: string;
  readonly algorithm: CryptoAlgorithm;
  readonly salt: Uint8Array;
  readonly hash: Uint8Array;
  readonly cost: number;
  readonly blockSize: number;
  readonly parallelization: number;
}

/**
 * Hashes a password using scrypt.
 *
 * Password hashes should be stored using the returned `encoded`
 * representation rather than storing the raw hash and salt separately.
 */
export async function hashPassword(
  password: string,
  options: PasswordHashOptions = {},
): Promise<PasswordHashResult> {
  assertPassword(
    password,
  );

  const saltBytes =
    options.saltBytes ??
    DEFAULT_SALT_BYTES;

  const keyBytes =
    options.keyBytes ??
    DEFAULT_KEY_BYTES;

  const cost =
    options.cost ??
    DEFAULT_SCRYPT_N;

  const blockSize =
    options.blockSize ??
    DEFAULT_SCRYPT_R;

  const parallelization =
    options.parallelization ??
    DEFAULT_SCRYPT_P;

  validateParameters({
    saltBytes,
    keyBytes,
    cost,
    blockSize,
    parallelization,
  });

  const salt =
    new Uint8Array(
      randomBytes(
        saltBytes,
      ),
    );

  const hash =
    await derivePasswordKey(
      password,
      salt,
      keyBytes,
      cost,
      blockSize,
      parallelization,
    );

  const encoded =
    encodePasswordHash({
      version:
        PASSWORD_FORMAT_VERSION,
      algorithm:
        CryptoAlgorithm.SCRYPT,
      salt,
      hash,
      cost,
      blockSize,
      parallelization,
    });

  return Object.freeze({
    algorithm:
      CryptoAlgorithm.SCRYPT,
    version:
      PASSWORD_FORMAT_VERSION,
    salt:
      new Uint8Array(salt),
    hash:
      new Uint8Array(hash),
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
    assertPassword(
      password,
    );

    const parameters =
      decodePasswordHash(
        encoded,
      );

    const derived =
      await derivePasswordKey(
        password,
        parameters.salt,
        parameters.hash.byteLength,
        parameters.cost,
        parameters.blockSize,
        parameters.parallelization,
      );

    if (
      derived.byteLength !==
      parameters.hash.byteLength
    ) {
      return false;
    }

    return timingSafeEqual(
      Buffer.from(
        derived,
      ),
      Buffer.from(
        parameters.hash,
      ),
    );
  } catch {
    return false;
  }
}

/**
 * Decodes an encoded password hash into its parameters.
 */
export function decodePasswordHash(
  encoded: string,
): PasswordHashParameters {
  if (
    typeof encoded !==
      "string" ||
    encoded.length === 0
  ) {
    throw new TypeError(
      "Password hash must be a non-empty string.",
    );
  }

  const parts =
    encoded.split("$");

  if (
    parts.length !== 6
  ) {
    throw new TypeError(
      "Invalid password hash format.",
    );
  }

  const [
    version,
    algorithm,
    costPart,
    blockSizePart,
    parallelizationPart,
    payload,
  ] = parts;

  if (
    version !==
    PASSWORD_FORMAT_VERSION
  ) {
    throw new TypeError(
      `Unsupported password hash version: ${version}.`,
    );
  }

  if (
    algorithm !==
    CryptoAlgorithm.SCRYPT
  ) {
    throw new TypeError(
      `Unsupported password hash algorithm: ${algorithm}.`,
    );
  }

  const cost =
    parsePositiveInteger(
      costPart,
      "cost",
    );

  const blockSize =
    parsePositiveInteger(
      blockSizePart,
      "blockSize",
    );

  const parallelization =
    parsePositiveInteger(
      parallelizationPart,
      "parallelization",
    );

  const payloadParts =
    payload.split(".");

  if (
    payloadParts.length !== 2
  ) {
    throw new TypeError(
      "Invalid password hash payload.",
    );
  }

  const [
    encodedSalt,
    encodedHash,
  ] = payloadParts;

  const salt =
    decodeBase64Url(
      encodedSalt,
    );

  const hash =
    decodeBase64Url(
      encodedHash,
    );

  if (
    salt.byteLength === 0
  ) {
    throw new TypeError(
      "Password hash salt cannot be empty.",
    );
  }

  if (
    hash.byteLength === 0
  ) {
    throw new TypeError(
      "Password hash cannot be empty.",
    );
  }

  validateParameters({
    saltBytes:
      salt.byteLength,
    keyBytes:
      hash.byteLength,
    cost,
    blockSize,
    parallelization,
  });

  return Object.freeze({
    version,
    algorithm:
      CryptoAlgorithm.SCRYPT,
    salt,
    hash,
    cost,
    blockSize,
    parallelization,
  });
}

/**
 * Encodes password hashing parameters into a portable string.
 *
 * Format:
 *
 * v1$scrypt$N$r$p$salt.hash
 */
export function encodePasswordHash(
  parameters: PasswordHashParameters,
): string {
  if (
    parameters.algorithm !==
    CryptoAlgorithm.SCRYPT
  ) {
    throw new TypeError(
      "Only scrypt password hashes are supported.",
    );
  }

  validateParameters({
    saltBytes:
      parameters.salt.byteLength,
    keyBytes:
      parameters.hash.byteLength,
    cost:
      parameters.cost,
    blockSize:
      parameters.blockSize,
    parallelization:
      parameters.parallelization,
  });

  if (
    parameters.version !==
    PASSWORD_FORMAT_VERSION
  ) {
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
      Buffer.from(
        parameters.salt,
      ).toString(
        "base64url",
      ),
      Buffer.from(
        parameters.hash,
      ).toString(
        "base64url",
      ),
    ].join("."),
  ].join("$");
}

/**
 * Returns the default password hashing parameters.
 */
export function getDefaultPasswordHashOptions(): Required<PasswordHashOptions> {
  return {
    saltBytes:
      DEFAULT_SALT_BYTES,
    keyBytes:
      DEFAULT_KEY_BYTES,
    cost:
      DEFAULT_SCRYPT_N,
    blockSize:
      DEFAULT_SCRYPT_R,
    parallelization:
      DEFAULT_SCRYPT_P,
  };
}

/**
 * Returns whether an encoded value is a valid password hash.
 */
export function isPasswordHash(
  encoded: string,
): boolean {
  try {
    decodePasswordHash(
      encoded,
    );

    return true;
  } catch {
    return false;
  }
}

/**
 * Returns whether a password meets the basic requirements.
 *
 * This helper deliberately does not impose application-specific
 * password policy such as required symbols or exact length.
 */
export function isValidPassword(
  password: string,
  minimumLength = 8,
): boolean {
  return (
    typeof password ===
      "string" &&
    password.length >=
      minimumLength
  );
}

async function derivePasswordKey(
  password: string,
  salt: Uint8Array,
  keyBytes: number,
  cost: number,
  blockSize: number,
  parallelization: number,
): Promise<Uint8Array> {
  const result =
    await scrypt(
      Buffer.from(
        password,
        "utf8",
      ),
      Buffer.from(
        salt,
      ),
      keyBytes,
      {
        N: cost,
        r: blockSize,
        p: parallelization,
        maxmem:
          calculateMaxMemory(
            cost,
            blockSize,
            parallelization,
          ),
      },
    );

  return new Uint8Array(
    result,
  );
}

function validateParameters(
  parameters: {
    readonly saltBytes: number;
    readonly keyBytes: number;
    readonly cost: number;
    readonly blockSize: number;
    readonly parallelization: number;
  },
): void {
  if (
    !Number.isInteger(
      parameters.saltBytes,
    ) ||
    parameters.saltBytes <
      16
  ) {
    throw new RangeError(
      "saltBytes must be an integer of at least 16.",
    );
  }

  if (
    !Number.isInteger(
      parameters.keyBytes,
    ) ||
    parameters.keyBytes <
      16
  ) {
    throw new RangeError(
      "keyBytes must be an integer of at least 16.",
    );
  }

  if (
    !Number.isInteger(
      parameters.cost,
    ) ||
    parameters.cost < 2 ||
    (
      parameters.cost &
      (parameters.cost - 1)
    ) !== 0
  ) {
    throw new RangeError(
      "cost must be a power of two greater than or equal to 2.",
    );
  }

  if (
    !Number.isInteger(
      parameters.blockSize,
    ) ||
    parameters.blockSize <=
      0
  ) {
    throw new RangeError(
      "blockSize must be a positive integer.",
    );
  }

  if (
    !Number.isInteger(
      parameters.parallelization,
    ) ||
    parameters.parallelization <=
      0
  ) {
    throw new RangeError(
      "parallelization must be a positive integer.",
    );
  }
}

function calculateMaxMemory(
  cost: number,
  blockSize: number,
  parallelization: number,
): number {
  const required =
    128 *
    cost *
    blockSize;

  const parallelOverhead =
    1024 *
    blockSize *
    parallelization;

  return Math.max(
    32 * 1024 * 1024,
    required +
      parallelOverhead +
      1024 * 1024,
  );
}

function parsePositiveInteger(
  value: string,
  name: string,
): number {
  if (
    !/^\d+$/.test(
      value,
    )
  ) {
    throw new TypeError(
      `${name} must be a positive integer.`,
    );
  }

  const parsed =
    Number(value);

  if (
    !Number.isSafeInteger(
      parsed,
    ) ||
    parsed <= 0
  ) {
    throw new RangeError(
      `${name} is outside the supported integer range.`,
    );
  }

  return parsed;
}

function decodeBase64Url(
  value: string,
): Uint8Array {
  if (
    value.length === 0 ||
    !/^[A-Za-z0-9_-]+$/.test(
      value,
    )
  ) {
    throw new TypeError(
      "Invalid Base64URL value.",
    );
  }

  if (
    value.length % 4 === 1
  ) {
    throw new TypeError(
      "Invalid Base64URL length.",
    );
  }

  return new Uint8Array(
    Buffer.from(
      value,
      "base64url",
    ),
  );
}

function assertPassword(
  password: string,
): void {
  if (
    typeof password !==
      "string"
  ) {
    throw new TypeError(
      "Password must be a string.",
    );
  }

  if (
    password.length === 0
  ) {
    throw new TypeError(
      "Password cannot be empty.",
    );
  }
}