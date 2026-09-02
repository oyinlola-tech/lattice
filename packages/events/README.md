# @oyinlola141/lattice-events

In-process event bus with middleware pipelines, subscription groups, and async handler execution. Use for domain events, decoupled reactions, and event-driven flows.

## When to use

Import this when you need:

- a typed pub/sub bus inside one process
- wildcard subscriptions (`order.*`)
- middleware (logging, retry, tracing) on the publish path
- handler isolation — one failing handler does not block others
- event handler registries with priorities

For cross-process or cross-service messaging, use `@oyinlola141/lattice-messaging` instead.

## Installation

```bash
npm install @oyinlola141/lattice-events
```

## Public API

```typescript
import {
  createEventBus,
  EventBus,
  type EventHandler,
  type EventMiddleware,
  type EventSubscription,
  type PublishOptions,
  type EventDefinition,
} from "@oyinlola141/lattice-events";
```

## Usage

```typescript
import { createEventBus } from "@oyinlola141/lattice-events";

const bus = createEventBus();

await bus.subscribe("order.created", async (event) => {
  console.log("new order", event.payload.id);
});

await bus.publish("order.created", { id: "o_1", total: 99 });
```

## License

MIT
