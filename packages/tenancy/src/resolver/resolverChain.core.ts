/**
 * Resolver chain — coordinates multiple resolvers with conflict detection.
 *
 * @module resolver/resolverChain
 */

import type {
  TenantResolver,
  TenantResolution,
  TenantResolutionResult,
  ResolverChainOptions,
} from "../tenancyTypes/resolverTypes.js";
import { TenantResolutionConflictError } from "../tenancyErrors/tenancyError.types.js";

/**
 * Create a resolver chain that tries resolvers in priority order.
 */
export function createResolverChain<Context = unknown>(
  resolvers: readonly TenantResolver<Context>[],
  options?: ResolverChainOptions,
) {
  // Sort by priority descending (higher priority first)
  const sorted = [...resolvers].sort((a, b) => b.priority - a.priority);

  return {
    /**
     * Resolve tenant from context using the chain.
     */
    async resolve(context: Context): Promise<TenantResolutionResult> {
      const candidates: TenantResolution[] = [];

      for (const resolver of sorted) {
        try {
          const result = await resolver.resolve(context);
          if (result) {
            candidates.push(result);
          }
        } catch {
          // Skip failed resolvers — continue chain
        }
      }

      if (candidates.length === 0) {
        return { resolution: undefined, candidates: [], conflict: false };
      }

      // Check for conflicts
      const uniqueTenantIds = new Set(candidates.map((c) => c.tenantId));
      const hasConflict = uniqueTenantIds.size > 1;

      if (hasConflict && options?.throwOnConflict) {
        throw new TenantResolutionConflictError(
          candidates.map((c) => `${c.source}:${c.tenantId}`),
        );
      }

      // Use highest priority (first in sorted list)
      return {
        resolution: candidates[0]!,
        candidates,
        conflict: hasConflict,
      };
    },
  };
}
