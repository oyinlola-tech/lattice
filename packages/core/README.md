# @zudolib/core

Application lifecycle management, execution context propagation, and runtime orchestration for Zudolib applications.

## Installation

```bash
npm install @zudolib/core
```

## Quick Start

```typescript
import { createApplication } from "@zudolib/core";

const app = await createApplication();

await app.start();
await app.stop();
```

## Features

- Application lifecycle management (start, stop, restart)
- Execution context propagation using `AsyncLocalStorage`
- Runtime state machine with dependency ordering
- Signal handling for graceful shutdown (SIGINT, SIGTERM)

## Use Cases

- Bootstrapping Zudolib applications
- Managing application lifecycle in serverless environments
- Coordinating startup and shutdown of multiple services
