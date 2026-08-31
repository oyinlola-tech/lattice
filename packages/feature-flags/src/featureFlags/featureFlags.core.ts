/**
 * FeatureFlags — the main public API.
 *
 * Provides isEnabled, get, evaluate, and snapshot methods.
 *
 * @module featureFlags/featureFlags
 */

import type { FeatureFlag } from "../featureFlagTypes/featureFlag.interface.js";
import type { FeatureFlagContext } from "../featureFlagTypes/featureFlagContext.js";
import type { FeatureFlagValue } from "../featureFlagTypes/featureFlagRule/featureFlagValue.type.js";
import type { FeatureFlagEvaluation } from "../featureFlagTypes/featureFlagEvaluation.js";
import type { FeatureFlagProvider } from "../featureFlagTypes/featureFlagProvider.js";
import type { FeatureFlagRegistry } from "../registry/registry.core.js";
import { createFeatureFlagRegistry } from "../registry/registry.core.js";
import { evaluateFlag } from "../evaluator/evaluator.core.js";
import { FeatureFlagNotFoundError } from "../featureFlagErrors/featureFlagError.types.js";
import { resolveDependencies, mergeContext } from "./featureFlags.resolve.js";

/** Options for creating a FeatureFlags instance. */
export interface FeatureFlagsOptions {
  /** Provider to load flag definitions from. */
  readonly provider: FeatureFlagProvider;
  /** Default context applied to all evaluations. */
  readonly defaultContext?: FeatureFlagContext;
  /** Whether to throw on missing flags (default: false, returns default value). */
  readonly throwOnMissing?: boolean;
}

/**
 * Create a FeatureFlags instance.
 *
 * @param options - Configuration options.
 * @returns A FeatureFlags API object.
 */
export function createFeatureFlags(options: FeatureFlagsOptions) {
  const { provider, defaultContext = {}, throwOnMissing = false } = options;
  let registry: FeatureFlagRegistry = createFeatureFlagRegistry();

  async function load(): Promise<void> {
    const flags = await provider.getAll();
    registry = createFeatureFlagRegistry(flags);
  }

  async function ensureLoaded(): Promise<void> {
    if (registry.size === 0) await load();
  }

  async function resolveFlag(key: string): Promise<FeatureFlag | undefined> {
    let flag = registry.get(key);
    if (!flag) {
      flag = await provider.get(key);
      if (flag) registry.set(flag);
    }
    return flag;
  }

  return {
    async isEnabled(key: string, context?: FeatureFlagContext): Promise<boolean> {
      const result = await this.evaluate<boolean>(key, context);
      return result.value;
    },

    async get<T extends FeatureFlagValue = FeatureFlagValue>(
      key: string,
      context?: FeatureFlagContext,
    ): Promise<T | undefined> {
      const result = await this.evaluate<T>(key, context);
      return result.value;
    },

    async getBoolean(key: string, defaultValue: boolean, context?: FeatureFlagContext): Promise<boolean> {
      const result = await this.evaluate<boolean>(key, context);
      if (result.reason === "not_found") return defaultValue;
      return result.value;
    },

    async evaluate<T extends FeatureFlagValue = FeatureFlagValue>(
      key: string,
      context?: FeatureFlagContext,
    ): Promise<FeatureFlagEvaluation<T>> {
      await ensureLoaded();

      const mergedCtx = mergeContext(defaultContext, context);
      const flag = await resolveFlag(key);

      if (!flag) {
        if (throwOnMissing) throw new FeatureFlagNotFoundError(key);
        return {
          key,
          value: undefined as unknown as T,
          reason: "not_found",
          defaulted: true,
        };
      }

      if (flag.dependencies && flag.dependencies.length > 0) {
        if (!resolveDependencies(key, registry)) {
          return {
            key,
            value: flag.defaultValue as T,
            reason: "dependency_disabled",
            defaulted: true,
          };
        }
      }

      return evaluateFlag<T>(flag, mergedCtx);
    },

    async snapshot(context?: FeatureFlagContext): Promise<ReadonlyMap<string, FeatureFlagEvaluation>> {
      await ensureLoaded();

      const mergedCtx = mergeContext(defaultContext, context);
      const flags = registry.getAll();
      const results = new Map<string, FeatureFlagEvaluation>();

      for (const flag of flags) {
        if (flag.visibility === "client") {
          results.set(flag.key, evaluateFlag(flag, mergedCtx));
        }
      }

      return results;
    },

    async refresh(): Promise<void> {
      await provider.refresh?.();
      await load();
    },

    async getAll(): Promise<readonly FeatureFlag[]> {
      await ensureLoaded();
      return registry.getAll();
    },
  };
}
