# @zudo/messaging

In-process message bus infrastructure with handlers, middleware, and publish/subscribe patterns.

## Installation

```bash
npm install @zudo/messaging
```

## Quick Start

```typescript
import { createMessageBus } from "@zudo/messaging";

const bus = createMessageBus();

bus.subscribe("user.created", (message) => {
  console.log("New user:", message.payload);
});

await bus.publish({
  type: "user.created",
  payload: { id: "123" },
});
```

## Features

- Message bus with pub/sub
- Middleware pipeline for messages
- Message handlers with dependencies
- In-memory transport
- Message serialization

## Use Cases

- Decoupling application components
- Event-driven workflows
- Plugin communication
- Background task queuing
