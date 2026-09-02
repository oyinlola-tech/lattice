# @oyinlola141/lattice-plugins

Plugin manager, registry, dependency resolver, lifecycle controller, events, and integration context. The basis for extending a Lattice app with third-party functionality.

## When to use

Import this when you need:

- load a plugin from a manifest or package
- resolve plugin dependencies before activation
- run plugin lifecycle hooks (install → enable → disable → uninstall)
- isolate plugin state via a `PluginContext`

## Installation

```bash
npm install @oyinlola141/lattice-plugins
```

## Public API

```typescript
import {
  PluginManager,
  PluginRegistryImpl,
  PluginLifecycleController,
  createPluginContext,
  createEventEmitter,
  type PluginDefinition,
  type PluginMetadata,
  type PluginContext,
  type PluginLifecycleEvent,
  type PluginHook,
  type DependencyResolution,
  type CreatePluginContextOptions,
  type PluginHooks,
} from "@oyinlola141/lattice-plugins";
```

## Usage

```typescript
import {
  PluginManager,
  createPluginContext,
} from "@oyinlattice141/lattice-plugins";

const ctx = createPluginContext({ logger, config });
const manager = new PluginManager(ctx);

await manager.load({
  name: "audit-log",
  version: "1.0.0",
  activate: async (ctx) => ctx.logger.info("audit-log activated"),
});
```

## License

MIT
