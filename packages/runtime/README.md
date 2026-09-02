# @oyinlola141/lattice-runtime

Application runtime orchestrator — composes lifecycle, dependency ordering, signal handling, readiness probes, and graceful shutdown into a single `start()` call.

## When to use

Import this when you need:

- a single `runtime.start()` that boots every registered component in order
- signal-aware shutdown (SIGINT, SIGTERM)
- readiness checks for orchestrators (k8s readiness probes)
- a clean composition root for your app

The CLI's generated `src/server.ts` uses `createRuntime` from this package.

## Installation

```bash
npm install @oyinlola141/lattice-runtime
```

## Public API

```typescript
import {
  DefaultRuntime,
  createRuntime,
  createTestRuntime,
  type Runtime,
  type RuntimeOptions,
  type RuntimeDependencies,
  type RuntimeContext,
  type RuntimeEvents,
  type RuntimeState,
  type ReadinessProbe,
  type Startup,
  type Shutdown,
  type SignalHandler,
  type Registry,
  type DependencyGraph,
} from "@oyinlola141/lattice-runtime";
```

## Usage

```typescript
import { createRuntime } from "@oyinlola141/lattice-runtime";

const runtime = createRuntime({
  onShutdown: async () => container.dispose(),
});

runtime.register("http", async () => startServer());
runtime.register("db", async () => openDb(), { dependsOn: [] });

await runtime.start();
process.on("SIGTERM", () => runtime.stop());
```

## License

MIT
