# Application

A Zudojs application is the top-level container for all modules, plugins, and infrastructure.

## Creating an Application

```typescript
import { createApplication } from "@zudojs/core";

const app = await createApplication({
  config: loadConfig(),
  modules: [UsersModule, OrdersModule],
  plugins: [AuditPlugin],
});

await app.start();
```

## Application Context

The application context is the controlled environment provided to modules, plugins, and handlers. It exposes:

- `container` — the DI container
- `config` — merged configuration
- `logger` — structured logger
- `events` — event bus
- `modules` — registered modules

Application code never receives the entire application object. It receives a context with only the capabilities it needs.

## Lifecycle Integration

The application participates in the full lifecycle:

1. **Bootstrap** — load config, initialize container, create event bus
2. **Register** — register modules and plugins
3. **Initialize** — initialize all modules in dependency order
4. **Start** — start all modules, begin accepting requests
5. **Running** — handle requests, process jobs
6. **Stop** — stop accepting requests, stop modules
7. **Dispose** — close connections, release resources

## Observability

Every lifecycle transition emits events. Logging, metrics, and tracing are built in.
