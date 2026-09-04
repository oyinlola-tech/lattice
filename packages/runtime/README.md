# @zudojs/runtime

Application lifecycle orchestrator with dependency ordering, rollback, signals, and readiness checks.

## Installation

```bash
npm install @zudojs/runtime
```

## Quick Start

```typescript
import { createRuntime } from "@zudojs/runtime";

const runtime = createRuntime({
  services: [api, database, queue],
});

await runtime.start();
await runtime.stop();
```

## Features

- Service dependency ordering
- Graceful shutdown with rollback
- Signal handling (SIGINT, SIGTERM)
- Readiness and health checks
- Lifecycle hooks (onStart, onStop, onReady)

## Use Cases

- Application bootstrapping
- Microservice orchestration
- Graceful shutdown handling
- Health check endpoints
