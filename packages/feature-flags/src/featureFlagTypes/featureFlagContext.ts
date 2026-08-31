/**
 * Feature flag evaluation context.
 *
 * Provides the execution context used to evaluate targeting rules.
 *
 * @module featureFlagTypes/featureFlagContext
 */

/** Context passed to flag evaluators for targeting decisions. */
export interface FeatureFlagContext {
  /** Unique identifier for the user. */
  readonly userId?: string;
  /** Unique identifier for the tenant/organization. */
  readonly tenantId?: string;
  /** Unique identifier for the session. */
  readonly sessionId?: string;
  /** Current environment name. */
  readonly environment?: string;
  /** Custom attributes for attribute-based targeting. */
  readonly attributes?: Readonly<Record<string, unknown>>;
}
