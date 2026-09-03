# @oyinlola141/lattice-schema

Type-safe schema definition, parsing, and validation engine for data contracts.

## Installation

```bash
npm install @oyinlola141/lattice-schema
```

## Quick Start

```typescript
import { Schema } from "@oyinlola141/lattice-schema";

const UserSchema = Schema.object({
  id: Schema.string().uuid(),
  email: Schema.string().email(),
  age: Schema.number().int().positive(),
});

type User = Schema.Infer<typeof UserSchema>;
```

## Features

- Type-safe schema definitions
- Runtime validation with detailed errors
- Schema composition and inheritance
- Transformations and defaults
- Circular reference support
- JSON Schema generation

## Use Cases

- API request/response validation
- Configuration validation
- Form data validation
- Data contract enforcement
