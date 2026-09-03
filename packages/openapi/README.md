# @oyinlola141/lattice-openapi

OpenAPI 3.1 specification generation, validation, and SDK generation for Lattice applications.

## Installation

```bash
npm install @oyinlola141/lattice-openapi
```

## Quick Start

```typescript
import { createOpenAPIRouter } from "@oyinlola141/lattice-openapi";

const router = createOpenAPIRouter({
  info: { title: "My API", version: "1.0.0" },
});

router.get("/users/:id", {
  responses: { 200: { schema: UserSchema } },
}, async (ctx) => {
  return ctx.params.id;
});
```

## Features

- OpenAPI 3.1 spec generation
- Route documentation decorators
- Schema integration with `@lattice/schema`
- Request/response validation
- SDK generation

## Use Cases

- REST API documentation
- Client SDK generation
- API contract validation
- Developer portals
