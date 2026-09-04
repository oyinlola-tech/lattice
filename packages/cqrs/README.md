# @zudojs/cqrs

Command Query Responsibility Segregation (CQRS) primitives for separating read and write operations.

## Installation

```bash
npm install @zudojs/cqrs
```

## Quick Start

```typescript
import { createCommandBus, createQueryBus } from "@zudojs/cqrs";

const commandBus = createCommandBus();
const queryBus = createQueryBus();

commandBus.register("CreateUser", async (command) => {
  return userRepository.create(command.data);
});

queryBus.register("GetUser", async (query) => {
  return userRepository.findById(query.id);
});
```

## Features

- Command bus for write operations
- Query bus for read operations
- Middleware pipeline for both
- Command and query handlers
- Result types for explicit returns

## Use Cases

- Complex domain logic
- Event-sourced systems
- Read/write model separation
- Audit trails and logging
