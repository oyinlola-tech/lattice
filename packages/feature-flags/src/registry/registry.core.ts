/**
 * Feature flag registry.
 *
 * Central store for flag definitions with O(1) lookup by key.
 *
 * @module registry/registry
 */

import type { FeatureFlag } from "../featureFlagTypes/featureFlag.interface.js";

/** A feature flag registry with O(1) lookup. */
export interface FeatureFlagRegistry {
  /** Get a flag by key. */
  get(key: string): FeatureFlag | undefined;
  /** Get all flags. */
  getAll(): readonly FeatureFlag[];
  /** Register a flag (adds or replaces). */
  set(flag: FeatureFlag): void;
  /** Register multiple flags. */
  setAll(flags: readonly FeatureFlag[]): void;
  /** Remove a flag by key. */
  delete(key: string): boolean;
  /** Check if a flag exists. */
  has(key: string): boolean;
  /** Number of registered flags. */
  readonly size: number;
}

/**
 * Create an in-memory feature flag registry.
 *
 * Uses a Map for O(1) key lookup.
 *
 * @param flags - Initial flags to register.
 * @returns A FeatureFlagRegistry instance.
 */
export function createFeatureFlagRegistry(
  flags: readonly FeatureFlag[] = [],
): FeatureFlagRegistry {
  const store = new Map<string, FeatureFlag>();

  for (const flag of flags) {
    store.set(flag.key, Object.freeze({ ...flag }));
  }

  return {
    get(key: string): FeatureFlag | undefined {
      return store.get(key);
    },

    getAll(): readonly FeatureFlag[] {
      return [...store.values()];
    },

    set(flag: FeatureFlag): void {
      store.set(flag.key, Object.freeze({ ...flag }));
    },

    setAll(flags: readonly FeatureFlag[]): void {
      for (const flag of flags) {
        store.set(flag.key, Object.freeze({ ...flag }));
      }
    },

    delete(key: string): boolean {
      return store.delete(key);
    },

    has(key: string): boolean {
      return store.has(key);
    },

    get size(): number {
      return store.size;
    },
  };
}
