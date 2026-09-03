# @zudoliblib/events

Event-driven architecture with event bus, emitter, middleware, and registry for decoupled communication.

## Installation

```bash
npm install @zudoliblib/events
```

## Quick Start

```typescript
import { createEventBus } from "@zudoliblib/events";

const bus = createEventBus();

bus.on("user.created", (event) => {
  console.log("New user:", event.payload.id);
});

await bus.emit({
  type: "user.created",
  payload: { id: "123", name: "Alice" },
});
```

## Features

- Event bus with middleware pipeline
- Event emitter with typed payloads
- Event registry for documentation and validation
- Wildcard event subscriptions
- Async event handlers
- Event replay and history

## Use Cases

- Decoupling application components
- Audit logging and change tracking
- Real-time notifications
- CQRS event sourcing
