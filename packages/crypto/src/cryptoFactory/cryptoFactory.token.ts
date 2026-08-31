import type {
  TokenEncoding,
} from "../cryptoToken/cryptoToken.core.js";

import {
  generateToken,
  generateApiKey,
  generateSessionToken,
  generateRefreshToken,
  generateVerificationToken,
  generatePasswordResetToken,
  generateCsrfToken,
  generateOtp,
} from "../cryptoToken/cryptoToken.core.js";

export async function factoryCreateToken(
  bytes = 32,
  prefix?: string,
  encoding: TokenEncoding = "base64url",
): Promise<string> {
  return generateToken({
    bytes,
    encoding,
    prefix,
  });
}

export async function factoryCreateApiKey(): Promise<string> {
  return generateApiKey();
}

export async function factoryCreateSessionToken(): Promise<string> {
  return generateSessionToken();
}

export async function factoryCreateRefreshToken(): Promise<string> {
  return generateRefreshToken();
}

export async function factoryCreateVerificationToken(): Promise<string> {
  return generateVerificationToken();
}

export async function factoryCreatePasswordResetToken(): Promise<string> {
  return generatePasswordResetToken();
}

export async function factoryCreateCsrfToken(): Promise<string> {
  return generateCsrfToken();
}

export async function factoryCreateOtp(
  digits = 6,
): Promise<string> {
  return generateOtp(digits);
}
