import type { SecurityConfig } from "../interfaces/index.js";
import { DEFAULT_JWT_EXPIRY } from "../constants/index.js";

/**
 * Creates the security configuration from environment variables.
 */
export function createSecurityConfig(): SecurityConfig {
  return {
    jwtSecret: process.env.JWT_SECRET ?? "dev-secret-key-change-in-production",
    jwtExpiresIn: process.env.JWT_EXPIRES_IN ?? DEFAULT_JWT_EXPIRY,
  };
}
