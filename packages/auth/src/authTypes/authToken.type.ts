/**
 * JWT token types and interfaces.
 *
 * @module authToken/authToken
 */

import type { UserId } from "../authTypes/authUser.type.js";
import type { TokenId } from "@zudo/constants";

/** JWT token string. */
export type JwtToken = string;

/** Token identifier. Re-exported from @zudo/constants for type safety. */
export type { TokenId } from "@zudo/constants";

/**
 * Token payload embedded in JWT.
 */
export interface TokenPayload {
  /** Subject (user ID) */
  readonly sub: UserId;
  /** Issued-at timestamp */
  readonly iat: number;
  /** Expiration timestamp */
  readonly exp: number;
  /** Token type: access or refresh */
  readonly typ: "access" | "refresh";
  /** Token ID for revocation */
  readonly jti: TokenId;
  /** User roles */
  readonly roles?: readonly string[];
  /** Custom claims */
  readonly [key: string]: unknown;
}

/**
 * Token pair returned after authentication.
 */
export interface TokenPair {
  /** Short-lived access token */
  readonly accessToken: JwtToken;
  /** Long-lived refresh token */
  readonly refreshToken: JwtToken;
  /** Access token expiration in seconds */
  readonly expiresIn: number;
  /** Token type (always "Bearer") */
  readonly tokenType: "Bearer";
}

/**
 * Configuration for token generation.
 */
export interface TokenConfig {
  /** Secret key for signing (access tokens) */
  readonly accessSecret: string;
  /** Secret key for signing (refresh tokens) */
  readonly refreshSecret: string;
  /** Access token TTL in seconds (default: 900 = 15 min) */
  readonly accessTtl?: number;
  /** Refresh token TTL in seconds (default: 604800 = 7 days) */
  readonly refreshTtl?: number;
  /** JWT issuer */
  readonly issuer?: string;
  /** JWT audience */
  readonly audience?: string;
}

/**
 * Result of token verification.
 */
export interface TokenVerificationResult {
  /** Whether the token is valid */
  readonly valid: boolean;
  /** Decoded payload (if valid) */
  readonly payload?: TokenPayload;
  /** Error message (if invalid) */
  readonly error?: string;
}
