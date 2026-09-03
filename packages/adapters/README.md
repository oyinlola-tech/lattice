# @zudo/adapters

Boundary layer between Lattice and external platforms with adapter contracts, registry, capabilities, and transport abstractions.

## Installation

```bash
npm install @zudo/adapters
```

## Quick Start

```typescript
import { createAdapterRegistry } from "@zudo/adapters";

const registry = createAdapterRegistry();

registry.register({
  name: "postgres",
  capabilities: ["query", "transaction"],
  connect: async () => {
    /* ... */
  },
});
```

## Features

- Adapter contracts and interfaces
- Adapter registry for discovery
- Capability-based selection
- Transport abstractions
- Health check integration

## Use Cases

- Database adapters
- Message queue adapters
- Cache adapters
- External service integrations
