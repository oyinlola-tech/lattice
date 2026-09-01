/**
 * Environment detection and helper utilities.
 *
 * @module environment/environment
 */

import { type Environment, Environments } from "./environment.type.js";

/** Node environment variable name for detecting the current environment. */
export const NODE_ENV_KEY = "NODE_ENV" as const;

/**
 * Read the current environment from process.env.
 *
 * Defaults to development when NODE_ENV is unset or invalid.
 *
 * @param envOverride - Optional env map override (useful for testing)
 * @returns The resolved Environment value
 */
export function resolveEnvironment(
  envOverride?: Record<string, string | undefined>,
): Environment {
  const raw = (envOverride ?? process.env)[NODE_ENV_KEY];
  if (typeof raw === "string" && raw.trim().length > 0) {
    const normalised = raw.trim().toLowerCase();
    if (normalised === "dev" || normalised === "development")
      return "development";
    if (normalised === "prod" || normalised === "production")
      return "production";
    if (normalised === "test") return "test";
    if (normalised === "staging") return "staging";
  }
  return "development";
}

/**
 * Check whether the current environment is production.
 */
export function isProduction(
  envOverride?: Record<string, string | undefined>,
): boolean {
  return resolveEnvironment(envOverride) === "production";
}

/**
 * Check whether the current environment is development.
 */
export function isDevelopment(
  envOverride?: Record<string, string | undefined>,
): boolean {
  return resolveEnvironment(envOverride) === "development";
}

/**
 * Check whether the current environment is test.
 */
export function isTest(
  envOverride?: Record<string, string | undefined>,
): boolean {
  return resolveEnvironment(envOverride) === "test";
}
