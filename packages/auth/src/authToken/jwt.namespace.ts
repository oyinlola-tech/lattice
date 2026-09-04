/**
 * @zudojs/auth — JWT Namespace
 *
 * Convenience namespace for all JWT-related utilities.
 */

import {
  createTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken,
} from "./authToken.core.js";

import {
  parseBearerToken,
  isTokenExpired,
  extractUserId,
} from "../authUtils/authUtils.helper.js";

export type {
  JwtToken,
  TokenPair,
  TokenConfig,
  TokenVerificationResult,
} from "../authTypes/authToken.type.js";

export const jwt = {
  createTokenPair,
  verifyAccessToken,
  verifyRefreshToken,
  refreshAccessToken,
  parseBearerToken,
  isTokenExpired,
  extractUserId,
};
