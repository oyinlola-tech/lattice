# @zudo/feature-flags

Feature flag system with deterministic rollouts, rule engine, providers, variants, snapshots, and evaluation context.

## Installation

```bash
npm install @zudo/feature-flags
```

## Quick Start

```typescript
import { createFeatureFlags } from "@zudo/feature-flags";

const flags = createFeatureFlags({
  rules: [
    { key: "new-ui", rollout: 0.1 },
    { key: "beta-feature", users: ["user-123"] },
  ],
});

const enabled = await flags.isEnabled("new-ui", { userId: "user-456" });
```

## Features

- Percentage rollouts
- User and segment targeting
- A/B testing variants
- Rule engine with AND/OR logic
- Snapshot export for client-side flags
- Evaluation context

## Use Cases

- Gradual feature rollouts
- A/B testing
- Kill switches
- Beta feature access
