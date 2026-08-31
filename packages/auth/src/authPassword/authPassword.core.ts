/**
 * Password hashing and verification using Node.js crypto scrypt.
 *
 * @module authPassword/authPassword
 *
 * Uses scrypt with salt for secure password hashing.
 * Compatible with Node.js ≥ 24 (no external dependencies).
 */

import { randomBytes, scrypt, timingSafeEqual } from "node:crypto";

/** Default salt length in bytes. */
const SALT_LENGTH = 32;

/** Default key length for scrypt. */
const KEY_LENGTH = 64;

/** Scrypt parameters (N, r, p). */
const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;

/**
 * Hash a plain-text password.
 *
 * @param password - Plain-text password
 * @param saltLength - Salt length in bytes (default: 32)
 * @returns Hashed password string in format "scrypt$salt$hash"
 */
export async function hashPassword(
  password: string,
  saltLength: number = SALT_LENGTH,
): Promise<string> {
  const salt = randomBytes(saltLength).toString("hex");
  const derivedKey = await deriveKey(password, salt);
  return `scrypt${salt}$${derivedKey}`;
}

/**
 * Verify a plain-text password against a hash.
 *
 * @param password - Plain-text password to verify
 * @param hashedPassword - Previously hashed password
 * @returns Whether the password matches
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string,
): Promise<boolean> {
  const parts = hashedPassword.split("$");
  if (parts.length !== 2 || !parts[0]!.startsWith("scrypt")) {
    return false;
  }
  const salt = parts[0]!.slice(6);
  const storedHash = parts[1]!;
  const derivedKey = await deriveKey(password, salt);
  const storedBuffer = Buffer.from(storedHash, "hex");
  const derivedBuffer = Buffer.from(derivedKey, "hex");
  if (storedBuffer.length !== derivedBuffer.length) {
    return false;
  }
  return timingSafeEqual(storedBuffer, derivedBuffer);
}

/**
 * Check if a password hash needs rehashing (e.g. after salt length change).
 *
 * @param hashedPassword - The stored hash
 * @returns Whether the hash should be regenerated
 */
export function needsRehash(hashedPassword: string): boolean {
  const parts = hashedPassword.split("$");
  if (parts.length !== 2 || !parts[0]!.startsWith("scrypt")) {
    return true;
  }
  const salt = parts[0]!.slice(6);
  const saltBytes = salt.length / 2;
  return saltBytes !== SALT_LENGTH;
}

/**
 * Generate a random token string (for password reset, etc.).
 *
 * @param length - Token length in bytes (default: 32)
 * @returns Hex-encoded random string
 */
export function generateRandomToken(length: number = 32): string {
  return randomBytes(length).toString("hex");
}

function deriveKey(password: string, salt: string): Promise<string> {
  return new Promise((resolve, reject) => {
    scrypt(
      password,
      salt,
      KEY_LENGTH,
      { N: SCRYPT_N, r: SCRYPT_R, p: SCRYPT_P },
      (err, derivedKey) => {
        if (err) reject(err);
        else resolve(derivedKey.toString("hex"));
      },
    );
  });
}
