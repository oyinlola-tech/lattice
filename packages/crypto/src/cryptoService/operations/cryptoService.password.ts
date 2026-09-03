import type {
  PasswordHashOptions,
  PasswordHashResult,
} from "../../cryptoPassword/cryptoPassword.type.js";

import {
  hashPassword,
  verifyPassword,
} from "../../cryptoPassword/cryptoPassword.core.js";

import { createCryptoError } from "@zudo/errors";

export type { PasswordHashOptions, PasswordHashResult };

export async function serviceHashPassword(
  password: string,
  options?: PasswordHashOptions,
): Promise<PasswordHashResult> {
  try {
    return await hashPassword(password, options);
  } catch {
    throw createCryptoError("Password hashing failed.", {});
  }
}

export async function serviceVerifyPassword(
  password: string,
  encodedHash: string,
): Promise<boolean> {
  try {
    return await verifyPassword(password, encodedHash);
  } catch {
    return false;
  }
}
