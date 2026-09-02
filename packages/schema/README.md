# @oyinlola141/lattice-schema

Type-safe schema definition and parsing engine with validation, transformation, and inference. Higher-level than `@oyinlola141/lattice-validation` — closer to Zod in ergonomics.

## When to use

Import this when you need:

- define a schema once, infer the type once
- chain `.parse()`, `.safeParse()`, `.transform()`, `.refine()`
- describe data contracts (DTOs, configs, events) as code

## Installation

```bash
npm install @oyinlola141/lattice-schema
```

## Public API

```typescript
import {
  schema,
  Schema,
  s,
  string,
  number,
  boolean,
  object,
  array,
  tuple,
  union,
  literal,
  type SchemaShape,
  type InferType,
  type ParseResult,
} from "@oyinlola141/lattice-schema";
```

## Usage

```typescript
import {
  schema,
  string,
  number,
  object,
  email,
} from "@oyinlola141/lattice-schema";

const UserSchema = schema({
  email: string().email(),
  age: number().int().min(0),
});

type User = InferType<typeof UserSchema>;

const user = UserSchema.parse(input);
const safe = UserSchema.safeParse(input);
```

## License

MIT
