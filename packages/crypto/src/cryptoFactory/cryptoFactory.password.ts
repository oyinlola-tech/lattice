import type { PasswordHashOptions } from "../cryptoPassword/cryptoPassword.type.js";

import {
  hashPassword,
  verifyPassword,
} from "../cryptoPassword/cryptoPassword.core.js";

export type { PasswordHashOptions };

export async function factoryCreatePasswordHash(
  password: string,
  options?: PasswordHashOptions,
) {
  return hashPassword(password, options);
}

export async function factoryVerifyPassword(
  password: string,
  encodedHash: string,
): Promise<boolean> {
  return verifyPassword(password, encodedHash);
}
