# @zudo/types

Shared type guards, utility types, and type converters for the Zudo framework.

## Installation

```bash
npm install @zudo/types
```

## Quick Start

```typescript
import {
  isPlainObject,
  isDate,
  isEmail,
  Maybe,
  DeepReadonly,
} from "@zudo/types";

if (isPlainObject(value)) {
  console.log(value.keys());
}

const id: Maybe<string> = null;
const config: DeepReadonly<AppConfig> = { db: { host: "localhost" } };
```

## Features

- Type guards (`isPlainObject`, `isDate`, `isEmail`, etc.)
- Utility types (`Maybe`, `DeepReadonly`, `Prettify`, etc.)
- Type converters and transformers
- Branded type utilities

## Use Cases

- Runtime type checking
- Type-safe utility functions
- Deep immutability
- Nullable type handling
