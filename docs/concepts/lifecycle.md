# Lifecycle

Every major Zudojs component has a well-defined lifecycle.

## States

```
register
  → install
    → initialize
      → start
        → running
          → stop
            → dispose
```

## Lifecycle Hooks

Components participate via hooks:

```typescript
class MyModule implements OnInitialize, OnStart, OnStop, OnDestroy {
  onInitialize() {
    // Prepare dependencies, validate configuration
  }

  onStart() {
    // Start HTTP server, begin listening
  }

  onStop() {
    // Stop accepting new work
  }

  onDestroy() {
    // Close connections, release resources
  }
}
```

## Lifecycle Participant

Full lifecycle participants expose all hooks plus a name:

```typescript
const participant: LifecycleParticipant = {
  name: "MyModule",
  initialize() { ... },
  start() { ... },
  stop() { ... },
  dispose() { ... },
};
```

## State Machine

Lifecycle transitions are enforced by a state machine. Invalid transitions throw errors, making bugs visible during development rather than in production.

## Graceful Shutdown

On SIGINT or SIGTERM:

1. Mark the application as draining.
2. Finish in-flight requests up to a deadline.
3. Stop modules in reverse dependency order.
4. Dispose resources.
5. Exit.
