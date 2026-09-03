# @zudoliblib/config

Layered configuration management with multiple sources, validation, and environment-specific overrides.

## Installation

```bash
npm install @zudoliblib/config
```

## Quick Start

```typescript
import { createConfig } from "@zudoliblib/config";

const config = await createConfig({
  sources: [
    env({ prefix: "APP_" }),
    file("./config.json"),
    defaults({ port: 3000 }),
  ],
});

const port = config.get("port");
```

## Features

- Layered source pattern with priority ordering
- Environment variable support with prefix matching
- JSON, YAML, and TOML file sources
- Schema validation with Zod
- Sensitive value auto-redaction
- Hot reload support

## Use Cases

- Application configuration
- Environment-specific settings (dev, staging, prod)
- Feature flags and toggles
- Secrets management integration
