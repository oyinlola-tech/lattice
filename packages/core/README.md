# @zudojs/core

Application lifecycle management, execution context propagation, and runtime orchestration for Zudojs applications.

## Installation

```bash
npm install @zudojs/core
```

## Quick Start

```typescript
import { createApplication } from "@zudojs/core";

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

- Bootstrapping Zudojs applications
- Managing application lifecycle in serverless environments
- Coordinating startup and shutdown of multiple services
