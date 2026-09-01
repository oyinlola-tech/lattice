# Lattice Package Rules

> This document defines the internal development standards for every `@lattice/*` package.
> All packages must follow these rules to ensure consistency, maintainability, and architectural integrity.

---

## 1. Package Responsibilities

### 1.1 Single Responsibility Principle

Every package must have exactly one reason to change.

- A package should solve one problem.
- If a package starts doing multiple things, split it.
- If a package is doing nothing, consider removing it.

### 1.2 Public API Surface

Every package exposes a public API through `src/index.ts`.

- The public API is the contract with consumers.
- Internal implementation details must not leak.
- Changes to the public API require a major version bump (at 1.0.0).

### 1.3 Internal Organization

Internal code is organized into folders by domain concern.

```
packages/events/src/
├── index.ts
├── eventBus/
│   ├── index.ts
│   ├── eventBus.factory.ts
│   └── eventBus.core.ts
├── eventEmitter/
│   ├── index.ts
│   ├── eventEmitter.core.ts
│   └── eventEmitter.dispatch.ts
├── eventRegistry/
│   ├── index.ts
│   ├── eventRegistry.store.ts
│   └── eventRegistry.validator.ts
├── eventTypes/
│   ├── index.ts
│   ├── eventDefinition.type.ts
│   └── eventPayload.type.ts
└── eventErrors/
    ├── index.ts
    ├── eventError.base.ts
    └── eventError.handler.ts
```

---

## 2. Package Boundaries

### 2.1 No Internal Leaking

- Do not import files from another package's internal folders (e.g., `@lattice/events/src/internal/...`).
- Always import from the package's public API (`@lattice/events`).
- If you need access to something not exported publicly, it should be exported.

### 2.2 No Circular Dependencies

- Circular dependencies are forbidden.
- See `DEPENDENCIES.md` for the tier system and dependency rules.
- Run `npm run architect:check` before committing.

### 2.3 No Unnecessary Dependencies

- Only import from packages you actually use.
- Do not add "just in case" dependencies.
- Every dependency adds maintenance burden.

### 2.4 External Dependencies

- Minimize external dependencies in foundational packages (Tier 0, Tier 1).
- External dependencies must be justified in the package README.
- Prefer standard library APIs over external packages when possible.

---

## 3. Public API Rules

### 3.1 Barrel Exports

All public exports must go through `src/index.ts`.

```ts
// src/index.ts
export { createEventBus } from "./eventBus/eventBus.factory.js";
export type { EventBus } from "./eventBus/eventBus.type.js";
```

### 3.2 No Default Exports

Use named exports only.

```ts
// ✅ Correct
export function createEventBus() { ... }
export class EventBus { ... }

// ❌ Wrong
export default function createEventBus() { ... }
export default class EventBus { ... }
```

### 3.3 Explicit Imports

Always use explicit imports. Do not use wildcard imports.

```ts
// ✅ Correct
import { createEventBus } from "@lattice/events";

// ❌ Wrong
import * as Events from "@lattice/events";
```

### 3.4 Type-Only Imports

Use `import type` for type-only imports.

```ts
// ✅ Correct
import type { EventBus } from "@lattice/events";

// ❌ Wrong
import { EventBus } from "@lattice/events";
```

### 3.5 Stable API

- Public APIs should remain backward compatible.
- Deprecate before removing.
- See Section 14 (Deprecation Policy).

---

## 4. Import Rules

### 4.1 Import Order

Imports must be ordered as follows:

1. Node.js built-ins
2. External packages
3. `@lattice/*` packages (alphabetical)
4. Internal imports (same package, relative paths)

```ts
// 1. Node.js built-ins
import { randomBytes } from "node:crypto";

// 2. External packages
import { z } from "zod";

// 3. Shared @lattice/* packages
import { BaseError, ErrorCode } from "@lattice/errors.js";
import type { EventBus } from "@lattice/events.js";

// 4. Internal imports (same package, with .js extension)
import { createEventBus } from "./eventBus/eventBus.factory.js";
```

### 4.2 No Deep Imports

Do not import from internal paths of other packages.

```ts
// ✅ Correct
import { EventBus } from "@lattice/events";

// ❌ Wrong
import { EventBus } from "@lattice/events/src/eventBus/eventBus.type.js";
```

### 4.3 Relative Imports Only for Same Package

Use relative imports only for files within the same package.

```ts
// ✅ Correct (same package)
import { helper } from "./utils/helper.js";

// ❌ Wrong (different package)
import { helper } from "../other-package/utils/helper.js";
```

---

## 5. Export Rules

### 5.1 Export Only Public APIs

`src/index.ts` must export only the public API.

- Do not export internal types, functions, or classes.
- Do not re-export from internal subpaths of other packages.

### 5.2 Re-exporting from Dependencies

When re-exporting types from dependencies, use `export type`.

```ts
// src/index.ts
export type { EventBus } from "@lattice/events.js";
```

### 5.3 No Side Effects in Barrel Files

`src/index.ts` must contain only exports.
No code, no initialization, no side effects.

```ts
// ✅ Correct
export { createEventBus } from "./eventBus/eventBus.factory.js";

// ❌ Wrong
console.log("Initializing events...");
export { createEventBus } from "./eventBus/eventBus.factory.js";
```

---

## 6. Naming Conventions

### 6.1 File Names

Use dot notation to separate domain prefix from concern.

| Pattern            | Example                    | Wrong                       |
| ------------------ | -------------------------- | --------------------------- |
| Single-word prefix | `http.error.ts`            | `http-error.ts`             |
| Multi-word prefix  | `externalService.error.ts` | `external-service-error.ts` |
| Types/interfaces   | `configManager.type.ts`    | `config-manager-type.ts`    |
| Utilities          | `cryptoRandom.helper.ts`   | `crypto-random-helper.ts`   |
| Constants          | `http.status.ts`           | `http-status.ts`            |
| Factory            | `eventBus.factory.ts`      | `event-bus-factory.ts`      |

### 6.2 Class Names

PascalCase.

```ts
class EventBus { ... }
class ConfigManager { ... }
```

### 6.3 Interface Names

PascalCase, no `I` prefix.

```ts
interface EventHandler { ... }
interface AuthProvider { ... }
```

### 6.4 Type Names

PascalCase.

```ts
type EventPayload = { ... };
type ConfigSchema = { ... };
```

### 6.5 Function Names

camelCase.

```ts
function createEventBus() { ... }
function validateConfig() { ... }
```

### 6.6 Variable Names

camelCase.

```ts
const eventHandler = ...;
const configStore = ...;
```

### 6.7 Constants

camelCase or UPPER_SNAKE for true constants.

```ts
const maxRetries = 3;
const DEFAULT_TIMEOUT = 5000;
```

### 6.8 Private Fields

`private readonly` preferred.

```ts
class EventBus {
  private readonly store: EventStore;
}
```

---

## 7. Folder Structure

### 7.1 Organization

Every `src/` directory must organize code into related folders.

### 7.2 Folder Limits

- No folder may contain more than 5 files (excluding `index.ts`).
- No file may exceed 150 lines of code.
- When a folder exceeds 5 files, group related files into a subfolder.
- When a file exceeds 150 lines, split by concern into a subfolder.

### 7.3 Folder Naming

- Use camelCase for folder names: `eventBus/`, `configManager/`, `cryptoKey/`
- Single-word folders stay lowercase: `errors/`, `handlers/`, `utils/`
- Same rules apply at every nesting level.

### 7.4 Every Folder Gets an index.ts

Every folder (at any depth) gets an `index.ts` barrel file with JSDoc.

```ts
/**
 * @lattice/events/eventBus
 *
 * Event bus creation, configuration, and management.
 */

export { createEventBus } from "./eventBus.factory.js";
export type { EventBus } from "./eventBus.type.js";
```

---

## 8. Code Style Rules

### 8.1 Strict TypeScript

- `strict: true` in tsconfig.
- No implicit `any`.
- No `any` — use `unknown` or specific types.

### 8.2 No var

Use `const` or `let`.

```ts
// ✅ Correct
const value = 1;
let count = 0;

// ❌ Wrong
var value = 1;
```

### 8.3 async/await Only

Use `async/await` exclusively for asynchronous operations.

```ts
// ✅ Correct
const result = await fetchData();

// ❌ Wrong
const result = fetchData().then(...);
```

### 8.4 readonly

Use `readonly` on all interface properties and where possible on class properties.

```ts
interface Plugin {
  readonly name: string;
  readonly version?: string;
}

class PluginManager {
  private readonly registry: PluginRegistry;
}
```

### 8.5 Object.freeze()

Use `Object.freeze()` for immutable data structures.

```ts
const config = Object.freeze({
  name: "my-app",
  version: "1.0.0",
});
```

### 8.6 JSDoc

Add JSDoc on all public API surfaces (classes, methods, interfaces, functions).

```ts
/**
 * Creates a new event bus instance.
 */
export function createEventBus(options?: EventBusOptions): EventBus {
  ...
}
```

### 8.7 No Inline Comments

Do not add inline comments in implementation code unless absolutely necessary.

```ts
// ✅ Correct — self-documenting code
const activeConnections = connections.filter((c) => c.state === "open");

// ❌ Wrong — unnecessary comment
// filter to only open connections
const activeConnections = connections.filter((c) => c.state === "open");
```

### 8.8 .js Extensions

Use `.js` extensions on all relative imports (ESM requirement).

```ts
// ✅ Correct
import { helper } from "./utils/helper.js";

// ❌ Wrong
import { helper } from "./utils/helper";
```

---

## 9. Dependency Rules

### 9.1 Follow the Tier System

See `DEPENDENCIES.md` for the complete tier system.

- Tier 0 packages must not depend on any `@lattice/*` package.
- Tier 1 packages may depend only on Tier 0.
- Tier 2 packages may depend on Tier 0 and Tier 1.
- Tier 3 packages may depend on Tier 0, Tier 1, and Tier 2.
- Tier 4 packages may depend on any tier.

### 9.2 Use Exact Versions

All `@lattice/*` dependencies must use exact versions (`0.1.0`).

```json
{
  "dependencies": {
    "@lattice/errors": "0.1.0"
  }
}
```

### 9.3 Peer Dependencies

Peer dependencies must be:

1. Optional.
2. Documented.
3. In a higher or equal tier.

---

## 10. Error Handling

### 10.1 Use @lattice/errors

All error types must live in `@lattice/errors`.
No package should create its own error classes that extend `Error` or `BaseError`.

### 10.2 Domain Errors

Each package may define lightweight wrapper classes for package-specific context, but the base error must come from `@lattice/errors`.

```ts
// ✅ Correct
export class PluginRegistrationError extends PluginError {
  constructor(message: string, pluginName?: string) {
    super(message, { code: ErrorCode.PLUGIN_REGISTRATION, pluginName });
  }
}

// ❌ Wrong
export class PluginRegistrationError extends Error {
  constructor(message: string) {
    super(message);
  }
}
```

### 10.3 Error Metadata

Errors should carry operational metadata.

```ts
throw new PluginDependencyError(
  "Plugin A depends on Plugin B which is not registered.",
  {
    pluginName: "A",
    metadata: { dependencyName: "B" },
  },
);
```

### 10.4 No Internal Error Leaking

Never expose internal error details (stack traces, internal codes) in user-facing responses.

---

## 11. Type Safety

### 11.1 No any

Do not use `any`. Use `unknown` or specific types.

```ts
// ✅ Correct
function parse(input: unknown): Result {
  if (typeof input === "string") { ... }
}

// ❌ Wrong
function parse(input: any): Result { ... }
```

### 11.2 Import Types from Owners

Before defining any type, interface, or type alias, check if it already exists in a shared package.

See `DEPENDENCIES.md` and `AGENTS.md` for the type ownership table.

### 11.3 Branded Types

Use branded types for IDs to prevent accidental mixing.

```ts
type UserId = Brand<string, "UserId">;
type EventId = Brand<string, "EventId">;
```

### 11.4 Discriminated Unions

Use discriminated unions for state machines and variants.

```ts
type PluginState =
  | { state: "registered" }
  | { state: "installing" }
  | { state: "installed" }
  | { state: "failed"; error: Error };
```

---

## 12. Performance

### 12.1 Minimize Allocations

- Prefer object pools for high-frequency allocations.
- Avoid unnecessary object creation in hot paths.

### 12.2 Avoid Reflection

- Minimize use of decorators and metadata reflection.
- Prefer compile-time code generation.

### 12.3 Lazy Initialization

Defer expensive operations until needed.

### 12.4 Concurrency Limits

Limit concurrency to prevent resource exhaustion.

```ts
await Promise.all(plugins.map((p) => p.start()));
// Better:
await pLimit(4)(plugins.map((p) => () => p.start()));
```

### 12.5 Caching

Cache frequently accessed data.
Invalidate caches explicitly.

---

## 13. Testing

### 13.1 Test Framework

Use Vitest for all tests.

### 13.2 Test Location

- Unit tests: `packages/<name>/tests/`
- Integration tests: `tests/integration/`

### 13.3 Test Naming

Test files must be named `<package-name>.test.ts`.

```ts
packages / events / tests / events.test.ts;
```

### 13.4 Test Coverage

All public APIs must have tests.
Aim for high coverage but prioritize critical paths.

### 13.5 Test Structure

Use `describe` and `it` blocks.

```ts
describe("EventBus", () => {
  describe("publish", () => {
    it("emits events to handlers", () => { ... });
    it("supports middleware", () => { ... });
  });
});
```

### 13.6 No Test Code in Production

Test utilities must live in `@lattice/testing`.
Test code must not be imported by production packages.

---

## 14. Documentation

### 14.1 Package README

Every package must have a `README.md` containing:

- Package purpose.
- Installation.
- Quick start.
- API reference.
- Examples.

### 14.2 JSDoc

All public APIs must have JSDoc comments.

```ts
/**
 * Creates a new event bus instance.
 *
 * @param options - Optional configuration.
 * @returns A new EventBus instance.
 */
export function createEventBus(options?: EventBusOptions): EventBus {
  ...
}
```

### 14.3 Examples

Provide examples for common use cases.

```ts
// examples/hello-world/src/main.ts
import { createApplication } from "@lattice/core";

const app = createApplication();
await app.start();
```

### 14.4 Architecture Docs

See `ARCHITECTURE.md` for the big picture.
See `DEPENDENCIES.md` for dependency rules.
See `ROADMAP.md` for implementation status.

---

## 15. Deprecation Policy

### 15.1 Deprecation Process

1. Mark the API as deprecated in JSDoc.
2. Emit a warning when the deprecated API is used.
3. Keep the API functional for at least one minor version.
4. Remove the API in the next major version.

### 15.2 Deprecation Notice

```ts
/**
 * @deprecated Use `createEventBusV2` instead.
 * Will be removed in v2.0.0.
 */
export function createEventBus() {
  console.warn("createEventBus is deprecated. Use createEventBusV2 instead.");
  ...
}
```

### 15.3 Communication

- Update `CHANGELOG.md`.
- Update package README.
- Announce in the release notes.

---

## 16. Package Checklist

Before submitting a package for review:

- [ ] Package follows the tier system (`DEPENDENCIES.md`).
- [ ] No circular dependencies (`npm run architect:check`).
- [ ] No wildcard versions in `package.json`.
- [ ] All public APIs are exported from `src/index.ts`.
- [ ] No default exports.
- [ ] Imports are ordered correctly.
- [ ] No `any` types.
- [ ] All public APIs have JSDoc.
- [ ] No business logic in barrel files.
- [ ] No file exceeds 150 lines.
- [ ] No folder exceeds 5 files (excluding `index.ts`).
- [ ] File names use dot notation.
- [ ] All tests pass (`npm run test`).
- [ ] Typecheck passes (`npm run typecheck`).
- [ ] `README.md` exists and is up to date.
- [ ] Package is listed in `ROADMAP.md`.
