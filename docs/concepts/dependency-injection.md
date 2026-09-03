# Dependency Injection

Zudo uses a token-based DI container for managing service lifetimes and dependencies.

## Registration

Services are registered with tokens:

```typescript
import { Container } from "@zudolib/container";

const container = new Container();

container.register(UserRepositoryToken, () => new UserRepository());
container.register(
  UserServiceToken,
  (ctx) => new UserService(ctx.resolve(UserRepositoryToken)),
);
```

## Resolution

Dependencies are resolved at runtime:

```typescript
const userService = container.resolve(UserServiceToken);
```

## Scopes

The container supports scoped lifecycles:

- **Singleton** — one instance for the application lifetime.
- **Scoped** — one instance per request/operation.
- **Transient** — a new instance for every resolution.

## Circular Dependency Prevention

The container detects circular dependencies at resolution time and throws a clear error.

## Interface-First Design

Consumers depend on abstractions, not concrete classes:

```typescript
container.register(UserRepositoryToken, () => new PostgresUserRepository());
// Later, swap without changing consumers:
container.register(UserRepositoryToken, () => new MongoUserRepository());
```
