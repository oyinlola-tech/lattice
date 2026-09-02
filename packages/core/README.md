# @oyinlola141/lattice-core

Core framework primitives — runtime, context, configuration, modules, and lifecycle. Re-exports the most-used shared pieces so the rest of your app imports from one place.

## When to use

Import this when you want:

- one canonical entry point for the framework's shared surface
- access to runtime, context, configuration, and modules without hunting across packages
- a stable import path for generated apps

The CLI's generated `src/app.ts` imports from `@lattice/core`.

## Installation

```bash
npm install @oyinlola141/lattice-core
```

## Public API

```typescript
import {
  // Runtime
  createRuntime,
  type Runtime,
  type RuntimeOptions,
  // Context
  createExecutionContext,
  type ExecutionContext,
  // Configuration
  defineConfig,
  createConfigManager,
  // Modules
  defineModule,
  type Module,
  type ModuleDefinition,
  // Container
  createContainer,
  token,
  // Lifecycle
  LifecycleStateMachine,
  LifecycleRegistry,
  // Errors
  BaseError,
  ApplicationError,
  // Logging
  createLogger,
  type Logger,
} from "@oyinlola141/lattice-core";
```

## Usage

```typescript
import {
  createRuntime,
  createContainer,
  defineConfig,
} from "@oyinlola141/lattice-core";

export default defineConfig({
  http: { port: 3000 },
});

const runtime = createRuntime({
  onShutdown: async () => container.dispose(),
});
await runtime.start();
```

## License

MIT
