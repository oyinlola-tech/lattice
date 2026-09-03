# @zudoliblib/container

Token-based dependency injection container for managing application dependencies and service lifetimes.

## Installation

```bash
npm install @zudoliblib/container
```

## Quick Start

```typescript
import { createContainer } from "@zudoliblib/container";

const container = createContainer();

container.register("logger", () => createLogger({ name: "app" }), {
  lifetime: "singleton",
});

const logger = container.resolve("logger");
```

## Features

- Token-based registration (string, symbol, class)
- Singleton, scoped, and transient lifetimes
- Automatic dependency resolution
- Circular dependency detection
- Container snapshots for testing

## Use Cases

- Managing service dependencies
- Testing with mock dependencies
- Plugin and module systems
- Application composition root
