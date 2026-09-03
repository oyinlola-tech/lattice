# @zudo/http

HTTP primitives, request handling, routing, middleware, and server infrastructure for Lattice applications.

## Installation

```bash
npm install @zudo/http
```

## Quick Start

```typescript
import { createHTTPServer } from "@zudo/http";

const server = createHTTPServer({
  handler: {
    async fetch(request) {
      return new Response("Hello from Lattice");
    },
  },
});

await server.start();
```

## Features

- Runtime-independent HTTP server abstraction
- Request/response wrappers with full Web API compatibility
- Middleware pipeline with error handling
- Router with parameter extraction
- CORS, security headers, and content negotiation
- HTTP client with interceptors

## Use Cases

- Building REST APIs
- Implementing middleware pipelines
- Handling HTTP requests in serverless environments
- Proxy and gateway implementations
