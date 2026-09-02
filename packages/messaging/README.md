# @oyinlola141/lattice-messaging

In-process message bus — request/response, fire-and-forget, and pipeline patterns. Different from `events` because messages have a single explicit handler, while events fan out.

## When to use

Import this when you need:

- command/query dispatch (paired with `@oyinlola141/lattice-cqrs`)
- middleware (auth, validation, timing) on the handler path
- synchronous or async handler resolution
- a single explicit handler per message type

For fan-out, use `@oyinlola141/lattice-events`. For long-running async work, use `@oyinlola141/lattice-queue`.

## Installation

```bash
npm install @oyinlola141/lattice-messaging
```

## Public API

```typescript
import {
  createMessageBus,
  MessageBus,
  type MessageHandler,
  type MessageMiddleware,
  type MessageContext,
  type MessageDefinition,
  type MessageResult,
} from "@oyinlola141/lattice-messaging";
```

## Usage

```typescript
import { createMessageBus } from "@oyinlola141/lattice-messaging";

const bus = createMessageBus();

bus.register("GetUser", async (msg) => {
  return db.findUser(msg.payload.id);
});

const user = await bus.dispatch("GetUser", { id: "u_1" });
```

## License

MIT
