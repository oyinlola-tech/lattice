# @zudojs/adapters

Boundary layer between Zudojs and external platforms with adapter contracts, registry, capabilities, and transport abstractions.

## Installation

```bash
npm install @zudojs/adapters
```

## Quick Start

```typescript
import { createAdapterRegistry } from "@zudojs/adapters";

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
