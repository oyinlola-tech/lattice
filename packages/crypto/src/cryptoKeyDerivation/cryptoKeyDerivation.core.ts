import {
  pbkdf2,
  pbkdf2Sync,
  randomBytes,
  scrypt,
  scryptSync,
} from "node:crypto";

import {
  promisify,
} from "node:util";

import {
  CryptoAlgorithm,
} from "../cryptoAlgorithm/cryptoAlgorithm.type.js";

const pbkdf2Async =
  promisify(pbkdf2);

const scryptAsync =
  promisify(scrypt);

export interface Pbkdf2Options {
  readonly iterations?: number;
  readonly keyLength?: number;
  readonly digest?: "sha256" | "sha384" | "sha512";
  readonly salt?: Uint8Array;
  readonly saltLength?: number;
}

export interface ScryptOptions {
  readonly keyLength?: number;
  readonly cost?: number;
  readonly blockSize?: number;
  readonly parallelization?: number;
  readonly salt?: Uint8Array;
  readonly saltLength?: number;
  readonly maxMemory?: number;
}

export interface DerivedKeyResult {
  readonly algorithm: CryptoAlgorithm;
  readonly key: Uint8Array;
  readonly salt: Uint8Array;
}

/**
 * Derives a key from a password using PBKDF2.
 */
export async function derivePbkdf2(
  password: string | Uint8Array,
  options: Pbkdf2Options = {},
): Promise<DerivedKeyResult> {
  const iterations =
    options.iterations ??
    310_000;

  const keyLength =
    options.keyLength ??
    32;

  const salt =
    options.salt
      ? new Uint8Array(options.salt)
      : new Uint8Array(
          randomBytes(
            options.saltLength ?? 16,
          ),
        );

  const digest =
    options.digest ??
    "sha256";

  validatePbkdf2Options(
    iterations,
    keyLength,
    salt,
  );

  const key =
    await pbkdf2Async(
      toBuffer(password),
      Buffer.from(salt),
      iterations,
      keyLength,
      digest,
    );

  return Object.freeze({
    algorithm:
      digest === "sha512"
        ? CryptoAlgorithm.PBKDF2_SHA512
        : CryptoAlgorithm.PBKDF2_SHA256,
    key: new Uint8Array(key),
    salt: new Uint8Array(salt),
  });
}

/**
 * Synchronous PBKDF2 derivation for controlled startup or CLI use.
 */
export function derivePbkdf2Sync(
  password: string | Uint8Array,
  options: Pbkdf2Options = {},
): DerivedKeyResult {
  const iterations =
    options.iterations ??
    310_000;

  const keyLength =
    options.keyLength ??
    32;

  const salt =
    options.salt
      ? new Uint8Array(options.salt)
      : new Uint8Array(
          randomBytes(
            options.saltLength ?? 16,
          ),
        );

  const digest =
    options.digest ??
    "sha256";

  validatePbkdf2Options(
    iterations,
    keyLength,
    salt,
  );

  const key =
    pbkdf2Sync(
      toBuffer(password),
      Buffer.from(salt),
      iterations,
      keyLength,
      digest,
    );

  return Object.freeze({
    algorithm:
      digest === "sha512"
        ? CryptoAlgorithm.PBKDF2_SHA512
        : CryptoAlgorithm.PBKDF2_SHA256,
    key: new Uint8Array(key),
    salt: new Uint8Array(salt),
  });
}

/**
 * Derives a key using scrypt.
 */
export async function deriveScrypt(
  password: string | Uint8Array,
  options: ScryptOptions = {},
): Promise<DerivedKeyResult> {
  const keyLength =
    options.keyLength ??
    32;

  const cost =
    options.cost ??
    16_384;

  const blockSize =
    options.blockSize ??
    8;

  const parallelization =
    options.parallelization ??
    1;

  const salt =
    options.salt
      ? new Uint8Array(options.salt)
      : new Uint8Array(
          randomBytes(
            options.saltLength ?? 16,
          ),
        );

  validateScryptOptions(
    keyLength,
    cost,
    blockSize,
    parallelization,
    salt,
  );

  const key =
    await (scryptAsync as (password: Buffer, salt: Buffer, keylen: number, options: Record<string, number>) => Promise<Buffer>)(
      toBuffer(password),
      Buffer.from(salt),
      keyLength,
      {
        N: cost,
        r: blockSize,
        p: parallelization,
        maxmem:
          options.maxMemory ??
          calculateMaxMemory(
            cost,
            blockSize,
            parallelization,
          ),
      },
    );

  return Object.freeze({
    algorithm:
      CryptoAlgorithm.SCRYPT,
    key: new Uint8Array(key),
    salt: new Uint8Array(salt),
  });
}

/**
 * Synchronous scrypt derivation.
 */
export function deriveScryptSync(
  password: string | Uint8Array,
  options: ScryptOptions = {},
): DerivedKeyResult {
  const keyLength =
    options.keyLength ??
    32;

  const cost =
    options.cost ??
    16_384;

  const blockSize =
    options.blockSize ??
    8;

  const parallelization =
    options.parallelization ??
    1;

  const salt =
    options.salt
      ? new Uint8Array(options.salt)
      : new Uint8Array(
          randomBytes(
            options.saltLength ?? 16,
          ),
        );

  validateScryptOptions(
    keyLength,
    cost,
    blockSize,
    parallelization,
    salt,
  );

  const key =
    scryptSync(
      toBuffer(password),
      Buffer.from(salt),
      keyLength,
      {
        N: cost,
        r: blockSize,
        p: parallelization,
        maxmem:
          options.maxMemory ??
          calculateMaxMemory(
            cost,
            blockSize,
            parallelization,
          ),
      },
    );

  return Object.freeze({
    algorithm:
      CryptoAlgorithm.SCRYPT,
    key: new Uint8Array(key),
    salt: new Uint8Array(salt),
  });
}

/**
 * Derives a key using the selected key derivation algorithm.
 */
export async function deriveKey(
  password: string | Uint8Array,
  algorithm: CryptoAlgorithm,
  options:
    | Pbkdf2Options
    | ScryptOptions = {},
): Promise<DerivedKeyResult> {
  switch (
    algorithm
  ) {
    case CryptoAlgorithm.PBKDF2_SHA256:
      return derivePbkdf2(
        password,
        {
          ...(options as Pbkdf2Options),
          digest: "sha256",
        },
      );

    case CryptoAlgorithm.PBKDF2_SHA512:
      return derivePbkdf2(
        password,
        {
          ...(options as Pbkdf2Options),
          digest: "sha512",
        },
      );

    case CryptoAlgorithm.SCRYPT:
      return deriveScrypt(
        password,
        options as ScryptOptions,
      );

    default:
      throw new TypeError(
        `Unsupported key derivation algorithm: ${algorithm}.`,
      );
  }
}

/**
 * Creates a random salt.
 */
export function generateSalt(
  length = 16,
): Uint8Array {
  if (
    !Number.isInteger(length) ||
    length < 16
  ) {
    throw new RangeError(
      "Salt length must be an integer of at least 16 bytes.",
    );
  }

  return new Uint8Array(
    randomBytes(length),
  );
}

function validatePbkdf2Options(
  iterations: number,
  keyLength: number,
  salt: Uint8Array,
): void {
  if (
    !Number.isInteger(iterations) ||
    iterations < 100_000
  ) {
    throw new RangeError(
      "PBKDF2 iterations must be at least 100000.",
    );
  }

  if (
    !Number.isInteger(keyLength) ||
    keyLength < 16
  ) {
    throw new RangeError(
      "PBKDF2 keyLength must be at least 16 bytes.",
    );
  }

  if (
    salt.byteLength < 16
  ) {
    throw new RangeError(
      "PBKDF2 salt must be at least 16 bytes.",
    );
  }
}

function validateScryptOptions(
  keyLength: number,
  cost: number,
  blockSize: number,
  parallelization: number,
  salt: Uint8Array,
): void {
  if (
    !Number.isInteger(keyLength) ||
    keyLength < 16
  ) {
    throw new RangeError(
      "scrypt keyLength must be at least 16 bytes.",
    );
  }

  if (
    !Number.isInteger(cost) ||
    cost < 2 ||
    (
      cost &
      (cost - 1)
    ) !== 0
  ) {
    throw new RangeError(
      "scrypt cost must be a power of two greater than or equal to 2.",
    );
  }

  if (
    !Number.isInteger(blockSize) ||
    blockSize <= 0
  ) {
    throw new RangeError(
      "scrypt blockSize must be a positive integer.",
    );
  }

  if (
    !Number.isInteger(parallelization) ||
    parallelization <= 0
  ) {
    throw new RangeError(
      "scrypt parallelization must be a positive integer.",
    );
  }

  if (
    salt.byteLength < 16
  ) {
    throw new RangeError(
      "scrypt salt must be at least 16 bytes.",
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

  const overhead =
    1024 *
    blockSize *
    parallelization;

  return Math.max(
    32 * 1024 * 1024,
    required +
      overhead +
      1024 * 1024,
  );
}

function toBuffer(
  value: string | Uint8Array,
): Buffer {
  if (
    typeof value === "string"
  ) {
    return Buffer.from(
      value,
      "utf8",
    );
  }

  if (
    value instanceof Uint8Array
  ) {
    return Buffer.from(value);
  }

  throw new TypeError(
    "Password or key material must be a string or Uint8Array.",
  );
}