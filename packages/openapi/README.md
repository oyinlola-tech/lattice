# @oyinlola141/lattice-openapi

OpenAPI 3.1 spec generation and runtime contract enforcement. Define an API once, generate the spec, and validate requests/responses at runtime.

## When to use

Import this when you need:

- generate an OpenAPI spec from your routes
- serve a Swagger UI
- runtime request/response validation against a schema
- typed client SDKs from the same spec

## Installation

```bash
npm install @oyinlola141/lattice-openapi
```

## Public API

```typescript
import {
  createOpenAPIGenerator,
  defineOperation,
  defineRoute,
  serveSwaggerUI,
  type OpenAPISpec,
  type OpenAPIDocument,
  type OpenAPIGeneratorOptions,
  type OperationDefinition,
  type RouteDefinition,
  type SecurityScheme,
  type Reference,
  type SchemaObject,
} from "@oyinlola141/lattice-openapi";
```

## Usage

```typescript
import {
  createOpenAPIGenerator,
  defineOperation,
} from "@oyinlola141/lattice-openapi";

const getUser = defineOperation({
  name: "GetUser",
  input: { id: "string" },
  output: { id: "string", email: "string" },
});

const generator = createOpenAPIGenerator();
const spec = generator.generate({ operations: [getUser] });
```

## License

MIT
