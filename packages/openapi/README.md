# @oyinlola141/lattice-openapi

OpenAPI 3.1 spec generation and runtime contract enforcement. Define an API once, generate the spec, and validate requests/responses at runtime.

## When to use

Import this when you need:

- generate an OpenAPI spec from your routes
- runtime request/response validation against a schema
- typed client SDKs from the same spec

## Installation

```bash
npm install @oyinlola141/lattice-openapi
```

## Public API

```typescript
import {
  OpenAPIManager,
  OpenAPIDocumentBuilder,
  OpenAPIRegistryImpl,
  OpenAPIValidatorImpl,
  SchemaRegistryImpl,
  toOpenAPIJSON,
  toOpenAPIYAML,
  type OpenAPIDocument,
  type OpenAPIVersion,
  type OpenAPISchema,
  type OpenAPIOperation,
  type OpenAPIPaths,
} from "@oyinlola141/lattice-openapi";
```

## Usage

```typescript
import { OpenAPIManager } from "@oyinlola141/lattice-openapi";

const manager = new OpenAPIManager("3.1.0");

manager.addRoute({
  method: "get",
  path: "/users/:id",
  metadata: {
    openapi: {
      operationId: "users.get",
      summary: "Get a user",
      responses: { "200": { description: "User found" } },
    },
  },
});

const document = manager.generate();
const json = manager.toJSON();
```

## License

MIT
