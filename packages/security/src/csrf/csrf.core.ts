/**
 * @zudo/security — CSRF Protection
 *
 * Generates and validates CSRF tokens for state-changing requests.
 */

import type { CsrfConfig } from "../types/security.type.js";
import { createHash, randomBytes } from "node:crypto";

/** Default token expiration (1 hour). */
const DEFAULT_EXPIRATION = 3600;

/** Default cookie name for CSRF token. */
const DEFAULT_COOKIE_NAME = "_csrf";

/** Default header name for CSRF token. */
const DEFAULT_HEADER_NAME = "x-csrf-token";

/** Methods that require CSRF protection. */
const SAFE_METHODS = ["GET", "HEAD", "OPTIONS", "TRACE"];

/** Default methods that require CSRF protection. */
const DEFAULT_METHODS = ["POST", "PUT", "PATCH", "DELETE"];

/**
 * Generates a cryptographically secure CSRF token.
 *
 * @param secret - The secret key for HMAC generation.
 * @param expiration - Optional expiration in seconds (default: 3600).
 * @returns The CSRF token string.
 */
export function generateCsrfToken(secret: string, expiration?: number): string {
  const ttl = expiration ?? DEFAULT_EXPIRATION;
  const expiresAt = Math.floor(Date.now() / 1000) + ttl;
  const random = randomBytes(16).toString("hex");
  const payload = `${expiresAt}:${random}`;
  const signature = createHash("sha256")
    .update(`${payload}:${secret}`)
    .digest("hex")
    .slice(0, 16);

  return `${payload}:${signature}`;
}

/**
 * Validates a CSRF token.
 *
 * @param token - The CSRF token to validate.
 * @param secret - The secret key for verification.
 * @param expiration - Optional expiration in seconds (default: 3600).
 * @returns True if the token is valid and not expired.
 */
export function validateCsrfToken(
  token: string,
  secret: string,
  expiration?: number,
): boolean {
  const ttl = expiration ?? DEFAULT_EXPIRATION;
  const parts = token.split(":");

  if (parts.length !== 3) {
    return false;
  }

  const [expiresAtStr, random, providedSignature] = parts;

  if (!expiresAtStr || !random || !providedSignature) {
    return false;
  }

  const expiresAt = parseInt(expiresAtStr, 10);

  if (isNaN(expiresAt)) {
    return false;
  }

  // Check expiration
  const now = Math.floor(Date.now() / 1000);
  if (now > expiresAt) {
    return false;
  }

  // Verify signature
  const payload = `${expiresAt}:${random}`;
  const expectedSignature = createHash("sha256")
    .update(`${payload}:${secret}`)
    .digest("hex")
    .slice(0, 16);

  // Constant-time comparison
  if (providedSignature.length !== expectedSignature.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < providedSignature.length; i++) {
    result |= providedSignature.charCodeAt(i) ^ expectedSignature.charCodeAt(i);
  }

  return result === 0;
}

/**
 * Checks if a request method requires CSRF protection.
 *
 * @param method - The HTTP method.
 * @param config - Optional CSRF configuration.
 * @returns True if CSRF protection is required.
 */
export function requiresCsrfProtection(
  method: string,
  config?: CsrfConfig,
): boolean {
  if (SAFE_METHODS.includes(method.toUpperCase())) {
    return false;
  }

  const methods = config?.methods ?? DEFAULT_METHODS;
  return methods.includes(method.toUpperCase());
}

/**
 * Extracts the CSRF token from request headers.
 *
 * @param headers - Request headers.
 * @param headerName - The header name to look for.
 * @returns The CSRF token, or undefined.
 */
export function extractCsrfTokenFromHeaders(
  headers: Record<string, string | string[] | undefined>,
  headerName?: string,
): string | undefined {
  const name = headerName ?? DEFAULT_HEADER_NAME;
  const value = headers[name];

  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0];
  }

  return undefined;
}

/**
 * Extracts the CSRF token from cookies.
 *
 * @param cookieHeader - The raw Cookie header.
 * @param cookieName - The cookie name to look for.
 * @returns The CSRF token, or undefined.
 */
export function extractCsrfTokenFromCookies(
  cookieHeader: string,
  cookieName?: string,
): string | undefined {
  const name = cookieName ?? DEFAULT_COOKIE_NAME;

  const cookies = cookieHeader.split(";").map((pair) => {
    const eqIndex = pair.indexOf("=");
    if (eqIndex === -1) return { name: pair.trim(), value: "" };
    return {
      name: pair.slice(0, eqIndex).trim(),
      value: pair.slice(eqIndex + 1).trim(),
    };
  });

  const cookie = cookies.find((c) => c.name === name);
  return cookie?.value || undefined;
}

/**
 * Generates Set-Cookie header for CSRF token.
 *
 * @param token - The CSRF token to store.
 * @param config - Optional CSRF configuration.
 * @returns The Set-Cookie header value.
 */
export function generateCsrfCookie(token: string, config?: CsrfConfig): string {
  const name = config?.cookieName ?? DEFAULT_COOKIE_NAME;
  const ttl = config?.expiration ?? DEFAULT_EXPIRATION;

  return [
    `${name}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${ttl}`,
  ].join("; ");
}
