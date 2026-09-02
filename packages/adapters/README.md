# @oyinlola141/lattice-adapters

Boundary layer between Lattice and external platforms — adapter contracts, registry, capabilities, transport abstractions, and mock adapters for tests.

## When to use

Import this when you need:

- define a custom adapter (storage, queue, runtime, CLI, ...)
- register it in the adapter registry and let the rest of the app resolve it by interface
- advertise capabilities so the framework can negotiate
- ship a mock adapter in your test suite

## Installation

```bash
npm install @oyinlola141/lattice-adapters
```

## Public API

```typescript
import {
  AdapterRegistry,
  type Adapter,
  type AdapterCapabilities,
  type AdapterMetadata,
  type StorageAdapter,
  type QueueAdapter,
  type QueueStats,
  type RuntimeAdapter,
  type CLIAdapter,
  type CLIOptions,
  type CLIResult,
  type AdapterErrorOptions,
  type Adapter as MockAdapter,
  type AdapterHealth as MockAdapterHealth,
  type AdapterRegistry as MockAdapterRegistry,
} from "@oyinlola141/lattice-adapters";
```

## Usage

```typescript
import {
  AdapterRegistry,
  type StorageAdapter,
} from "@oyinlola141/lattice-adapters";

class S3Storage implements StorageAdapter {
  readonly metadata = { name: "s3", version: "1.0" };
  async put(key: string, data: Buffer) {
    /* ... */
  }
  async get(key: string) {
    /* ... */
  }
}

const registry = new AdapterRegistry();
registry.register("storage", new S3Storage());
const storage = registry.resolve<StorageAdapter>("storage");
```

## License

MIT
