# @oyinlola141/lattice-config

Layered configuration management — load from files, environment variables, CLI args, or remote stores, then resolve with a priority chain.

## When to use

Import this when you need:

- merge config from multiple sources (defaults < file < env < CLI)
- type-safe `defineConfig` for editor autocomplete
- secret redaction (values matching `password|secret|token|api_key`)
- hot-reload when files or env change
- nested config with `get`/`set` and dot-notation paths

## Installation

```bash
npm install @oyinlola141/lattice-config
```

## Public API

```typescript
import {
  defineConfig,
  createConfigManager,
  ConfigManager,
  EnvSource,
  FileSource,
  ObjectSource,
  JsonSource,
  DotenvSource,
  type ConfigSource,
  type ConfigSchema,
  type ConfigManagerOptions,
} from "@oyinlola141/lattice-config";
```

## Usage

```typescript
import {
  defineConfig,
  createConfigManager,
  EnvSource,
  FileSource,
} from "@oyinlola141/lattice-config";

export default defineConfig({
  http: { port: 3000 },
  db: { url: "postgres://localhost/app" },
});

const cfg = createConfigManager({
  sources: [
    new FileSource({ path: "./lattice.config.ts" }),
    new EnvSource({ prefix: "APP_" }),
  ],
});

await cfg.load();
const port = cfg.get<number>("http.port");
```

## License

MIT
