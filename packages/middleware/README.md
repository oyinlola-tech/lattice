# @zudolib/middleware

Composable middleware pipeline with composition, timing, error handling, and context propagation.

## Installation

```bash
npm install @zudolib/middleware
```

## Quick Start

```typescript
import {
  createMiddlewarePipeline,
  createTimeoutMiddleware,
} from "@zudolib/middleware";

const pipeline = createMiddlewarePipeline([
  createTimeoutMiddleware(5000),
  createLoggingMiddleware(),
  createAuthMiddleware(),
]);

await pipeline(context, async () => {
  return handler(context);
});
```

## Features

- Composable middleware pipeline
- Error handling middleware
- Timing and metrics middleware
- Context propagation
- Early termination support

## Use Cases

- HTTP middleware chains
- Event processing pipelines
- Command/query middleware
- Cross-cutting concerns
