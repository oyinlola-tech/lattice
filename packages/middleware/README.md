# @oyinlola141/lattice-middleware

Composable middleware — chain, branch, time, and apply cross-cutting concerns (auth, logging, rate limiting) to any pipeline.

## When to use

Import this when you need:

- a middleware pipeline for HTTP, message buses, RPC, or your own protocol
- standard middlewares: timing, error handler, request id, CORS
- compose middlewares in any order, with branches

This package is engine-agnostic. For HTTP-specific middleware, see `@oyinlola141/lattice-http`.

## Installation

```bash
npm install @oyinlola141/lattice-middleware
```

## Public API

```typescript
import {
  compose,
  branch,
  withTiming,
  withErrorHandler,
  withRequestId,
  type Middleware,
  type MiddlewareContext,
  type MiddlewareChain,
  type Next,
} from "@oyinlola141/lattice-middleware";
```

## Usage

```typescript
import {
  compose,
  withTiming,
  withErrorHandler,
} from "@oyinlola141/lattice-middleware";

const pipeline = compose(withTiming({ logger }), withErrorHandler({ onError }));

await pipeline(ctx, async () => handle(ctx));
```

## License

MIT
