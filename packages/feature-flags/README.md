# @oyinlola141/lattice-feature-flags

Feature flag evaluation — deterministic rollouts, rule engine, providers, variants, snapshots, and an evaluation context for user/tenant targeting.

## When to use

Import this when you need:

- turn a feature on for a percentage of users (deterministic)
- target by attribute (country, plan, tenant)
- register multiple providers (memory, env, remote)
- cache evaluations to avoid hot-path lookups
- A/B test with variants and weighted distribution

## Installation

```bash
npm install @oyinlola141/lattice-feature-flags
```

## Public API

```typescript
import {
  createFeatureFlags,
  createFeatureFlagRegistry,
  createMemoryProvider,
  createEnvironmentProvider,
  createCompositeProvider,
  createCachedProvider,
  evaluateFlag,
  evaluateRule,
  matchAttribute,
  hashString,
  getBucket,
  isInRollout,
  FeatureFlagError,
  isPlainObject,
  valuesEqual,
  type FeatureFlag,
  type FeatureFlagContext,
  type FeatureFlagProvider,
  type FeatureFlagEvaluation,
  type FeatureFlagRule,
  type FeatureFlagsOptions,
  type FeatureFlagRegistry,
  type EnvironmentProviderOptions,
  type CachedProviderOptions,
  type RuleEvaluationResult,
} from "@oyinlola141/lattice-feature-flags";
```

## Usage

```typescript
import {
  createFeatureFlags,
  createMemoryProvider,
} from "@oyinlola141/lattice-feature-flags";

const flags = createFeatureFlags({
  providers: [
    createMemoryProvider({
      "new-checkout": { enabled: true, rollout: { percentage: 50 } },
    }),
  ],
});

const result = await flags.evaluate("new-checkout", { userId: "u_1" });
if (result.enabled) {
  /* show new checkout */
}
```

## License

MIT
