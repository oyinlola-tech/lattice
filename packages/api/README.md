# @oyinlola141/lattice-api

Higher-level API layer — operation definitions, execution context, interceptors, policies, and a transport-agnostic executor. Sits above `@oyinlola141/lattice-http` and `@oyinlola141/lattice-cqrs`.

## When to use

Import this when you need:

- define an operation once and call it from HTTP, RPC, queue, or CLI
- apply the same interceptors (auth, logging, retry) regardless of transport
- typed `APIContext` flowing through every handler

## Installation

```bash
npm install @oyinlola141/lattice-api
```

## Public API

```typescript
import {
  defineOperation,
  APIExecutor,
  APIOperationRegistry,
  createNoopInterceptor,
  normalizeAPIError,
  type APIContext,
  type APIContextKey,
  type APIHandler,
  type APIInterceptor,
  type OperationDefinition,
  type APIErrorOptions,
} from "@oyinlola141/lattice-api";
```

## Usage

```typescript
import {
  defineOperation,
  APIOperationRegistry,
} from "@oyinlola141/lattice-api";

const getUser = defineOperation({
  name: "GetUser",
  input: { id: "string" },
  handler: async ({ input, context }) => db.findUser(input.id),
});

const registry = new APIOperationRegistry();
registry.register(getUser);
const result = await registry.dispatch("GetUser", { id: "u_1" }, ctx);
```

## License

MIT
