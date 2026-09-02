# @oyinlola141/lattice-rpc

Type-safe RPC — define procedures, apply middleware, dispatch calls, and serve over HTTP or your own transport.

## When to use

Import this when you need:

- a typed RPC layer between services (gateway ↔ microservice, frontend ↔ backend)
- procedure-level middleware (auth, tracing, rate limit)
- a dispatcher that picks the right transport
- structured RPC errors

For request/response inside one process, prefer `@oyinlola141/lattice-api`.

## Installation

```bash
npm install @oyinlola141/lattice-rpc
```

## Public API

```typescript
import {
  createRPCProcedure,
  RPCDispatcher,
  RPCServer,
  RPCMiddlewareStack,
  createRPCContext,
  type RPCContext,
  type RPCMiddleware,
  type RPCProcedure,
  type RPCRequest,
  type RPCResponse,
  type RPCErrorOptions,
} from "@oyinlola141/lattice-rpc";
```

## Usage

```typescript
import { createRPCProcedure, RPCDispatcher } from "@oyinlola141/lattice-rpc";

const sum = createRPCProcedure({
  name: "sum",
  input: { a: "number", b: "number" },
  handler: ({ input }) => input.a + input.b,
});

const dispatcher = new RPCDispatcher();
dispatcher.register(sum);
const result = await dispatcher.call("sum", { a: 1, b: 2 });
```

## License

MIT
