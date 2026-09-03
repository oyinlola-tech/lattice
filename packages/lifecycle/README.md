# @zudo/lifecycle

Application and component lifecycle orchestration with state machine, dependency ordering, graceful shutdown, rollback, and signals.

## Installation

```bash
npm install @zudo/lifecycle
```

## Quick Start

```typescript
import { createLifecycleManager } from "@zudo/lifecycle";

const manager = createLifecycleManager({
  components: [database, server, worker],
});

await manager.start();
await manager.stop();
```

## Features

- State machine for lifecycle phases
- Dependency ordering between components
- Graceful shutdown with timeouts
- Rollback on startup failure
- Signal handling
- Lifecycle hooks and events

## Use Cases

- Coordinating service startup and shutdown
- Managing component lifecycles
- Handling process signals
- Zero-downtime deployments
