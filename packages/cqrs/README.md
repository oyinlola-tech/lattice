# @oyinlola141/lattice-cqrs

Command Query Responsibility Segregation — separate write models (commands) from read models (queries), with handler registries, decorators, and middleware.

## When to use

Import this when you need:

- explicit command and query types
- handler auto-registration via decorators or registries
- middleware on the command/query path (auth, validation, transactions)
- a single bus for both commands and queries

The CLI's `lattice generate command` and `lattice generate query` produce files designed for this package.

## Installation

```bash
npm install @oyinlola141/lattice-cqrs
```

## Public API

```typescript
import {
  createCommandBus,
  createQueryBus,
  CommandBus,
  QueryBus,
  type BaseCommand,
  type BaseQuery,
  type CommandHandler,
  type QueryHandler,
  type CommandResult,
  type QueryResult,
  type CommandMiddleware,
  type QueryMiddleware,
} from "@oyinlola141/lattice-cqrs";
```

## Usage

```typescript
import {
  createCommandBus,
  type BaseCommand,
  type CommandHandler,
} from "@oyinlola141/lattice-cqrs";

class CreateUser implements BaseCommand<{ email: string }> {
  readonly commandName = "CreateUser";
  constructor(public readonly payload: { email: string }) {}
}

class CreateUserHandler implements CommandHandler<CreateUser, { id: string }> {
  async handle(cmd: CreateUser) {
    return { id: crypto.randomUUID() };
  }
}

const bus = createCommandBus();
bus.register(new CreateUserHandler());
const result = await bus.execute(new CreateUser({ email: "a@b.com" }));
```

## License

MIT
