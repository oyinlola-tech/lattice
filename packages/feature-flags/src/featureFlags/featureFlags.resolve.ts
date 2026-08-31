/**
 * Dependency resolution and context merging for FeatureFlags.
 *
 * @module featureFlags/featureFlags.resolve
 */

import type { FeatureFlagContext } from "../featureFlagTypes/featureFlagContext.js";
import type { FeatureFlagRegistry } from "../registry/registry.core.js";

/**
 * Resolve dependencies for a flag, detecting cycles.
 *
 * @param key - The flag key to resolve.
 * @param registry - The flag registry.
 * @param visited - Set of already-visited keys (for cycle detection).
 * @returns True if all dependencies are enabled.
 */
export function resolveDependencies(
  key: string,
  registry: FeatureFlagRegistry,
  visited: Set<string> = new Set(),
): boolean {
  if (visited.has(key)) return false;

  visited.add(key);
  const flag = registry.get(key);

  if (!flag || !flag.enabled) return false;
  if (!flag.dependencies || flag.dependencies.length === 0) return true;

  for (const dep of flag.dependencies) {
    if (!resolveDependencies(dep, registry, visited)) return false;
  }

  return true;
}

/**
 * Merge default context with provided context.
 */
export function mergeContext(
  defaultContext: FeatureFlagContext,
  context?: FeatureFlagContext,
): FeatureFlagContext {
  if (!context) return defaultContext;
  return {
    ...defaultContext,
    ...context,
    attributes: {
      ...defaultContext.attributes,
      ...context.attributes,
    },
  };
}
