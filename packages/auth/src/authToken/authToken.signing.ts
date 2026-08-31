/**
 * Internal JWT signing and verification helpers.
 *
 * @module authToken/authToken.signing
 *
 * Not exported from the package barrel — used internally by authToken.core.ts.
 */

import { createHmac, timingSafeEqual } from "node:crypto";
import { randomBytes } from "node:crypto";
import type {
  JwtToken,
  TokenId,
  TokenPayload,
  TokenConfig,
  TokenVerificationResult,
} from "../authTypes/authToken.type.js";

/** HMAC signing algorithm. */
const ALGORITHM = "HS256";

/**
 * Sign a JWT payload with HMAC SHA-256.
 */
export function signToken(payload: TokenPayload, secret: string): JwtToken {
  const header = base64UrlEncode(JSON.stringify({ alg: ALGORITHM, typ: "JWT" }));
  const body = base64UrlEncode(JSON.stringify(payload));
  const signatureInput = `${header}.${body}`;
  const signature = hmacSha256(signatureInput, secret);
  return `${signatureInput}.${signature}`;
}

/**
 * Verify a JWT token's signature, expiration, and type.
 */
export function verifyToken(
  token: JwtToken,
  secret: string,
  expectedType: "access" | "refresh",
  config: TokenConfig,
): TokenVerificationResult {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return { valid: false, error: "Invalid token format" };
  }

  const [headerB64, bodyB64, signature] = parts;
  const signatureInput = `${headerB64}.${bodyB64}`;
  const expectedSignature = hmacSha256(signatureInput, secret);

  const sigBuffer = Buffer.from(signature ?? "", "hex");
  const expectedBuffer = Buffer.from(expectedSignature, "hex");

  if (sigBuffer.length !== expectedBuffer.length ||
      !timingSafeEqual(sigBuffer, expectedBuffer)) {
    return { valid: false, error: "Invalid signature" };
  }

  let payload: TokenPayload;
  try {
    payload = JSON.parse(base64UrlDecode(bodyB64!)) as TokenPayload;
  } catch {
    return { valid: false, error: "Invalid payload" };
  }

  const now = Math.floor(Date.now() / 1000);

  if (payload.exp < now) {
    return { valid: false, error: "Token expired" };
  }

  if (payload.typ !== expectedType) {
    return { valid: false, error: `Expected ${expectedType} token` };
  }

  if (config.issuer && payload.iss !== config.issuer) {
    return { valid: false, error: "Invalid issuer" };
  }

  return { valid: true, payload };
}

/**
 * Generate a random token ID.
 */
export function generateTokenId(): TokenId {
  return randomBytes(16).toString("hex") as TokenId;
}

// ─── Internal helpers ─────────────────────────────────────────────────────

function hmacSha256(data: string, secret: string): string {
  return createHmac("sha256", secret).update(data).digest("hex");
}

function base64UrlEncode(data: string): string {
  return Buffer.from(data)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64UrlDecode(data: string): string {
  const padded = data.replace(/-/g, "+").replace(/_/g, "/");
  const padLength = (4 - (padded.length % 4)) % 4;
  return Buffer.from(padded + "=".repeat(padLength), "base64").toString("utf-8");
}
