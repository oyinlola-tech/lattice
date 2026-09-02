# @oyinlola141/lattice-validation

Schema validation with composable constraints, type inference, and rich error reporting. Use for request body validation, configuration, or any data contract.

## When to use

Import this when you need:

- validate unknown input (HTTP body, env, config, message payloads)
- compose reusable constraints (`minLength`, `email`, `oneOf`, ...)
- infer the TS type from a schema
- collect all errors at once instead of failing on the first
- parse and normalize input (trim, lowercase, default values)

For richer type-driven schemas, see `@oyinlola141/lattice-schema`.

## Installation

```bash
npm install @oyinlola141/lattice-validation
```

## Public API

```typescript
import {
  string,
  number,
  boolean,
  array,
  object,
  union,
  literal,
  minLength,
  maxLength,
  pattern,
  email,
  oneOf,
  optional,
  nullable,
  validate,
  parse,
  createValidator,
  type Schema,
  type ValidationResult,
  type ValidationError,
  type InferType,
} from "@oyinlola141/lattice-validation";
```

## Usage

```typescript
import {
  object,
  string,
  number,
  email,
  minLength,
  validate,
} from "@oyinlola141/lattice-validation";

const UserSchema = object({
  email: string([email()]),
  age: number([minLength(0)]),
  name: string([minLength(2)]),
});

type User = InferType<typeof UserSchema>;

const result = validate(UserSchema, input);
if (!result.ok) return res.status(400).json(result.errors);
```

## License

MIT
