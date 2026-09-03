import type {
  DeriveKeyOptions,
  CryptoInput,
  KeyDerivationAlgorithm,
} from "../../../cryptoProvider/index.js";
import { pbkdf2, scrypt, randomBytes, timingSafeEqual } from "node:crypto";
import {
  toBytes,
  toBase64Url,
  fromBase64Url,
} from "../nodeCryptoProvider.helper.js";
import { cryptoKeyDerivationError } from "@zudo/errors";

export async function deriveKey(
  options: DeriveKeyOptions,
): Promise<Uint8Array> {
  const password = toBytes(options.password);
  const salt = options.salt;

  switch (options.algorithm) {
    case "pbkdf2": {
      return new Promise((resolve, reject) => {
        const keyLength = options.keyLength ?? 32;
        pbkdf2(
          Buffer.from(password),
          Buffer.from(salt),
          options.iterations ?? 100_000,
          keyLength,
          "sha256",
          (err, derived) => {
            if (err) {
              reject(
                cryptoKeyDerivationError("Key derivation failed.", "pbkdf2"),
              );
            } else {
              resolve(new Uint8Array(derived));
            }
          },
        );
      });
    }

    case "scrypt": {
      return new Promise((resolve, reject) => {
        const keyLength = options.keyLength ?? 32;
        scrypt(
          Buffer.from(password),
          Buffer.from(salt),
          keyLength,
          {
            N: options.memoryCost ?? 16384,
            r: 8,
            p: options.parallelism ?? 1,
          },
          (err, derived) => {
            if (err) {
              reject(
                cryptoKeyDerivationError("Key derivation failed.", "scrypt"),
              );
            } else {
              resolve(new Uint8Array(derived));
            }
          },
        );
      });
    }

    case "argon2id": {
      throw new TypeError("Argon2id requires the argon2 package.");
    }

    default:
      throw new TypeError(
        `Unsupported key derivation algorithm: ${options.algorithm}.`,
      );
  }
}
