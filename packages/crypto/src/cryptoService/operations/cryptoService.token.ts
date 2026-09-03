import type {
  TokenOptions,
  TokenEncoding,
} from "../../cryptoToken/cryptoToken.core.js";

import {
  generateToken,
  generateOtp,
} from "../../cryptoToken/cryptoToken.core.js";

import {
  hashToken,
  verifyTokenHash,
} from "../../cryptoToken/cryptoToken.hash.js";

import { createCryptoError, cryptoHashError } from "@zudoliblib/errors";

export type { TokenOptions, TokenEncoding };

export async function serviceGenerateToken(
  options?: TokenOptions,
): Promise<string> {
  try {
    return await generateToken(options);
  } catch {
    throw createCryptoError("Token generation failed.", {});
  }
}

export async function serviceGenerateOtp(digits = 6): Promise<string> {
  try {
    return await generateOtp(digits);
  } catch {
    throw createCryptoError("OTP generation failed.", {});
  }
}

export async function serviceHashToken(token: string): Promise<string> {
  try {
    return await hashToken(token);
  } catch {
    throw cryptoHashError("Token hashing failed.", "sha256");
  }
}

export async function serviceVerifyToken(
  token: string,
  expectedHash: string,
): Promise<boolean> {
  try {
    return await verifyTokenHash(token, expectedHash);
  } catch {
    return false;
  }
}
