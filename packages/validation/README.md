# @zudo/validation

Schema validation with Zod integration, constraints, parsers, composers, circular detection, and depth/size checks.

## Installation

```bash
npm install @zudo/validation
```

## Quick Start

```typescript
import { validate, z } from "@zudo/validation";

const schema = z.object({
  email: z.string().email(),
  age: z.number().int().positive(),
});

const result = validate(schema, input);
if (!result.success) {
  console.error(result.issues);
}
```

## Features

- Zod schema integration
- Constraint validation
- Composable validators
- Circular reference detection
- Depth and size limits
- Async validation support

## Use Cases

- Form validation
- API input validation
- Configuration validation
- Data contract enforcement
