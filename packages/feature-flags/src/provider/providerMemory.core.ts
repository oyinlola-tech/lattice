/**
 * In-memory feature flag provider.
 *
 * Stores flags in a Map for O(1) lookup. Ideal for local apps and testing.
 *
 * @module provider/providerMemory
 */

import type { FeatureFlag } from "../featureFlagTypes/featureFlag.interface.js";
import type { FeatureFlagProvider } from "../featureFlagTypes/featureFlagProvider.js";

/**
 * Create an in-memory feature flag provider.
 *
 * @param flags - Initial flag definitions.
 * @returns A FeatureFlagProvider backed by a Map.
 */
export function createMemoryProvider(flags: readonly FeatureFlag[] = []): FeatureFlagProvider {
  const store = new Map<string, FeatureFlag>();

  for (const flag of flags) {
    store.set(flag.key, Object.freeze({ ...flag }));
  }

  return {
    async get(key: string): Promise<FeatureFlag | undefined> {
      return store.get(key);
    },

    async getAll(): Promise<readonly FeatureFlag[]> {
      return [...store.values()];
    },

    /** Add or update a flag at runtime. */
    set(flag: FeatureFlag): void {
      store.set(flag.key, Object.freeze({ ...flag }));
    },

    /** Remove a flag by key. */
    delete(key: string): boolean {
      return store.delete(key);
    },
  } as FeatureFlagProvider & { set(flag: FeatureFlag): void; delete(key: string): boolean };
}
