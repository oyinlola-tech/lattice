import type {
  CryptoInput,
  KeyDerivationAlgorithm,
} from "../../../cryptoProvider/index.js";
import { randomBytes, pbkdf2, scrypt, timingSafeEqual } from "node:crypto";
import {
  toBytes,
  toBase64Url,
  fromBase64Url,
} from "../nodeCryptoProvider.helper.js";
import { PASSWORD_FORMAT_VERSION } from "../../../cryptoPassword/cryptoPassword.codec.js";
import { decodePasswordHash } from "../../../cryptoPassword/cryptoPassword.codec.js";

export async function hashPassword(
  password: CryptoInput,
  options?: {
    algorithm?: KeyDerivationAlgorithm;
    memoryCost?: number;
    timeCost?: number;
    blockSize?: number;
    parallelism?: number;
    keyBytes?: number;
    salt?: Uint8Array;
  },
): Promise<string> {
  const algorithm = options?.algorithm ?? "scrypt";
  const salt = options?.salt ?? randomBytes(16);
  const blockSize = options?.blockSize ?? 8;
  const keyBytes = options?.keyBytes ?? 32;

  let hash: Uint8Array;

  switch (algorithm) {
    case "scrypt": {
      const passwordBytes = toBytes(password);
      hash = await new Promise((resolve, reject) => {
        scrypt(
          passwordBytes,
          salt,
          keyBytes,
          {
            N: options?.memoryCost ?? 16384,
            r: blockSize,
            p: options?.parallelism ?? 1,
          },
          (err: Error | null, derived: Buffer) => {
            if (err) {
              reject(err);
            } else {
              resolve(new Uint8Array(derived));
            }
          },
        );
      });
      break;
    }

    case "argon2id": {
      throw new TypeError("Argon2id requires the argon2 package.");
    }

    case "pbkdf2": {
      const passwordBytes = toBytes(password);
      hash = await new Promise((resolve, reject) => {
        pbkdf2(
          passwordBytes,
          salt,
          options?.timeCost ?? 100_000,
          keyBytes,
          "sha256",
          (err, derived) => {
            if (err) {
              reject(err);
            } else {
              resolve(new Uint8Array(derived));
            }
          },
        );
      });
      break;
    }

    default:
      throw new TypeError(`Unsupported password algorithm: ${algorithm}.`);
  }

  const saltB64 = toBase64Url(salt);
  const hashB64 = toBase64Url(hash);

  return [
    PASSWORD_FORMAT_VERSION,
    algorithm,
    options?.memoryCost ?? 16384,
    blockSize,
    options?.parallelism ?? 1,
    `${saltB64}.${hashB64}`,
  ].join("$");
}

export async function verifyPassword(
  password: CryptoInput,
  hash: string,
): Promise<boolean> {
  const parts = hash.split("$");
  if (parts.length !== 6 || parts[0] !== "v1") {
    return false;
  }

  const [
    version,
    algorithm,
    costPart,
    blockSizePart,
    parallelizationPart,
    payload,
  ] = parts;
  if (version !== "v1" || !payload) {
    return false;
  }

  const payloadParts = payload.split(".");
  if (payloadParts.length !== 2) {
    return false;
  }

  const [saltB64] = payloadParts;
  if (!saltB64) {
    return false;
  }
  const salt = fromBase64Url(saltB64);

  const computed = await hashPassword(password, {
    algorithm: algorithm as KeyDerivationAlgorithm,
    memoryCost: Number(costPart),
    blockSize: Number(blockSizePart),
    parallelism: Number(parallelizationPart),
    salt,
  });

  const computedParts = computed.split("$");
  if (computedParts.length !== 6) {
    return false;
  }

  const expectedHash = fromBase64Url(computedParts[5]!.split(".")[1]!);

  const decoded = decodePasswordHash(hash);
  return timingSafeEqual(decoded.hash, expectedHash);
}
