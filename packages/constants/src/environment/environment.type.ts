/**
 * Application environment constants.
 *
 * @module environment/environment
 */

/** Type-safe environment name string. */
export type Environment = "development" | "test" | "staging" | "production";

/**
 * All supported environments as an object map.
 */
export const Environments = Object.freeze({
  DEVELOPMENT: "development",
  TEST: "test",
  STAGING: "staging",
  PRODUCTION: "production",
} as const);

/** Set of all valid environments for quick membership checks. */
export const ENVIRONMENTS: ReadonlySet<Environment> = new Set<Environment>(
  Object.values(Environments) as Environment[],
);

/**
 * Check whether a string is a valid Environment value.
 */
export function isValidEnvironment(value: string): value is Environment {
  return ENVIRONMENTS.has(value as Environment);
}
