# @oyinlola141/lattice-lifecycle

Application and component lifecycle orchestration — state machine, dependency ordering, graceful shutdown, rollback, and signal handling.

## When to use

Import this when you need:

- a state machine for component lifecycle (init → start → ready → stop)
- topologically sort components by their declared dependencies
- graceful shutdown with timeouts and rollback on failure
- a registry that other frameworks can plug into

## Installation

```bash
npm install @oyinlola141/lattice-lifecycle
```

## Public API

```typescript
import {
  LifecycleStateMachine,
  LifecycleRegistry,
  LifecycleExecutor,
  LifecycleEventEmitter,
  createLifecycleContext,
  buildExecutionPlan,
  type LifecycleComponent,
  type LifecyclePhase,
  type LifecycleContext,
  type ExecutionPlan,
  type ExecutionResult,
} from "@oyinlola141/lattice-lifecycle";
```

## Usage

```typescript
import {
  LifecycleStateMachine,
  createLifecycleContext,
} from "@oyinlola141/lattice-lifecycle";

const ctx = createLifecycleContext();
const sm = new LifecycleStateMachine(ctx);
await sm.start();
await sm.stop();
```

## License

MIT
