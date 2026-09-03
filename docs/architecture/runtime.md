# Runtime

The runtime orchestrates the entire Zudolib application.

## Responsibilities

- Bootstrap the application from configuration.
- Coordinate module and plugin lifecycles.
- Manage the dependency container.
- Handle signals (SIGINT, SIGTERM) for graceful shutdown.
- Expose health checks and diagnostics.

## Runtime States

```
Created → Initializing → Ready → Running → Draining → Stopped
```

## Runtime Events

The runtime emits events for observability:

- `runtime:creating`
- `runtime:initializing`
- `runtime:ready`
- `runtime:running`
- `runtime:draining`
- `runtime:stopped`
- `runtime:error`

## State Machine

Lifecycle state transitions are enforced by a state machine. Invalid transitions throw errors, making bugs visible during development rather than in production.
