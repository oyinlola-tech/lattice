/**
 * Tenant resolver types.
 *
 * @module tenancyTypes/resolverTypes
 */

import type { TenantId } from "./tenantIdentity.js";
import type { TenantResolutionSource, TenantTrustLevel } from "./tenantInterface.js";

/** A tenant resolution result from a resolver. */
export interface TenantResolution {
  readonly tenantId: TenantId;
  readonly source: TenantResolutionSource;
  readonly trust: TenantTrustLevel;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Result of resolver chain execution with conflict detection. */
export interface TenantResolutionResult {
  readonly resolution: TenantResolution | undefined;
  readonly candidates: readonly TenantResolution[];
  readonly conflict: boolean;
}

/** Interface for tenant resolvers. */
export interface TenantResolver<Context = unknown> {
  readonly name: string;
  readonly priority: number;
  resolve(context: Context): Promise<TenantResolution | undefined>;
}

/** Options for resolver chain. */
export interface ResolverChainOptions {
  /** Whether to detect conflicts between resolver results. */
  readonly detectConflicts?: boolean;
  /** Throw on conflict instead of using highest priority. */
  readonly throwOnConflict?: boolean;
}
