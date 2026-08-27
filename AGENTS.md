# AGENTS.md — Lattice Framework

> Coding conventions and agent instructions for the Lattice framework.
> Every agent reads this file before doing any work.

---

## Project Overview

Lattice is a TypeScript modular application framework (npm workspaces monorepo) with DI container, layered configuration, lifecycle management, execution context propagation, structured logging, cryptography, validation, and event systems.

## Stack

- **Language:** TypeScript 5.x (strict mode)
- **Runtime:** Node.js ≥ 24
- **Package Manager:** npm ≥ 11 (workspaces)
- **Build:** `tsc` per package
- **Test:** Vitest
- **Module:** ESM (`"type": "module"`)
- **Version:** All packages at `0.1.0`
- **License:** MIT (see `LICENSE` at root)

---

## Cross-Package Dependency Rules

### Rule: Use Shared Packages, Never Duplicate

When working in a package and you need functionality that exists in another `@lattice/*` package, **always import from that package** instead of re-implementing.

| Need | Use | Never |
|------|-----|-------|
| Error handling | `@lattice/errors` (`BaseError`, `ErrorCode`, etc.) | Writing error classes from scratch |
| Validation schemas | `@lattice/validation` (constraints, parsers, composers) | Creating ad-hoc validation logic |
| Logging | `@lattice/logger` (createLogger, transports) | `console.log` or custom loggers |
| Crypto | `@lattice/crypto` (hashing, encryption, tokens) | Using `crypto` directly without wrappers |
| Events | `@lattice/events` (EventBus, middleware) | Custom event emitters |
| Config | `@lattice/config` (sources, resolvers) | Hardcoding configuration |
| DI | `@lattice/container` (tokens, registration) | Manual dependency wiring |

### Rule: If Missing, Add to the Shared Package

If you need functionality that **should** exist in a shared package but doesn't:

1. **Check** if the shared package has the feature (search its `src/` directory)
2. **If not**, add it to the shared package (not to your current package)
3. **Import** it from the shared package in your current package
4. **Never** create a duplicate implementation in a consuming package

### Rule: Package Dependency Direction

```
errors ← (all packages depend on this)
    ↑
container, logger, events, crypto, validation, config
    ↑
core (depends on all above)
```

- **Leaf packages** (errors, logger) have no internal dependencies
- **Feature packages** depend only on leaf packages
- **Core** depends on everything else

### Rule: Adding New Shared Functionality

When adding a new module that could be shared:

1. Ask: "Will other packages need this?"
2. If yes → add to the appropriate shared package
3. If no → add to the current package
4. When in doubt, make it shared

### Rule: New Packages and Type Extraction

When a new `@lattice/*` package is introduced (e.g. `@lattice/types`, `@lattice/utils`):

1. **Scan all existing packages** for types, interfaces, or utilities that belong in the new package.
2. **Move** matching code from consuming packages into the new shared package.
3. **Update imports** in all consuming packages to point to the new package.
4. **Never leave duplicates** — if it's in the shared package, remove it from the consuming package.

Example: If `@lattice/types` is created, scan for:
- Shared interfaces used across multiple packages
- Common type aliases (`EventId`, `UserId`, `Timestamp`, etc.)
- Shared enums or const objects
- Type guard functions

Then move them and update all imports:
```typescript
// Before (duplicated in events and config)
import type { EventId } from "../eventTypes/eventDefinition.type.js";

// After (centralized in @lattice/types)
import type { EventId } from "@lattice/types.js";
```

---

## File Naming Convention (Dot Notation)

All source files use **dot notation** to separate the domain prefix from the concern.

### Rules

| Pattern | Example | Wrong |
|---------|---------|-------|
| Single-word prefix | `http.error.ts` | `http-error.ts` |
| Multi-word prefix (camelCase) | `externalService.error.ts` | `external-service-error.ts` |
| Types/interfaces | `configManager.type.ts` | `config-manager-type.ts` |
| Utilities | `cryptoRandom.helper.ts` | `crypto-random-helper.ts` |
| Constants | `http.status.ts` | `http-status.ts` |
| Factory | `eventBus.factory.ts` | `event-bus-factory.ts` |

### Breakdown

```
<prefix>.<concern>.ts
```

- **prefix:** The domain entity. PascalCase if multi-word (e.g. `externalService`, `configManager`), lowercase if single word (e.g. `http`, `crypto`).
- **concern:** What the file contains. Lowercase: `error`, `type`, `factory`, `helper`, `constant`, `interface`, `schema`, `utils`, `service`, `handler`, `manager`, `builder`, `validator`, `serializer`.

### Barrel Exports

- Each `src/index.ts` is a barrel file that re-exports the public API.
- Every folder gets an `index.ts` barrel with JSDoc documentation.
- Barrel files do NOT contain implementation code.

---

## Folder Organization

### Rules

1. **Every `src/` directory** must organize code into **related folders**.
2. **No folder** may contain more than **5 files** (excluding `index.ts`).
3. **No file** may exceed **150 lines** of code.
4. Folders may contain **subfolders**, and subfolders may contain their own subfolders, recursively, until the structure is no longer needed.
5. Every folder (at any depth) gets an `index.ts` barrel file with JSDoc.
6. When a folder exceeds 5 files, group related files into a subfolder.

### Folder Naming

- Use **camelCase** for folder names: `eventBus/`, `configManager/`, `cryptoKey/`
- Single-word folders stay lowercase: `errors/`, `handlers/`, `utils/`
- Same rules apply at every nesting level.

### Nested Folder Example

```
packages/crypto/src/
├── index.ts
├── cryptoKey/
│   ├── index.ts
│   ├── cryptoKey.type.ts           # key types and interfaces
│   ├── cryptoKeyDerivation/        # subfolder for derivation
│   │   ├── index.ts
│   │   ├── cryptoKeyDerivation.core.ts
│   │   └── cryptoKeyDerivation.pbkdf2.ts
│   └── cryptoKeyStorage/           # subfolder for storage
│       ├── index.ts
│       └── cryptoKeyStorage.file.ts
├── cryptoHash/
│   ├── index.ts
│   └── cryptoHash.core.ts
└── cryptoCipher/
    ├── index.ts
    └── cryptoCipher.core.ts
```

The nesting depth is unlimited — keep going until the structure is clean and each folder stays under 5 files.

### Structure Example

```
packages/events/src/
├── index.ts                    # barrel with JSDoc
├── eventBus/
│   ├── index.ts                # barrel with JSDoc
│   ├── eventBus.factory.ts     # creates EventBus instances
│   ├── eventBus.middleware.ts   # middleware pipeline
│   └── eventBus.publisher.ts   # publish logic
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

### Splitting Large Files

When a file exceeds 150 lines, split by **concern** into a subfolder:

| Original | Split Into |
|----------|-----------|
| `eventBus.ts` (1000+ lines) | `eventBus/eventBus.core.ts`, `eventBus/eventBus.middleware.ts`, `eventBus/eventBus.publisher.ts` |
| `configManager.ts` (800+ lines) | `configManager/configManager.core.ts`, `configManager/configManager.validator.ts`, `configManager/configManager.loader.ts` |
| `cryptoKeyDerivation.ts` (500+ lines) | `cryptoKey/cryptoKeyDerivation/cryptoKeyDerivation.core.ts`, `cryptoKey/cryptoKeyDerivation/cryptoKeyDerivation.pbkdf2.ts` |

When a folder exceeds 5 files, create a subfolder and move related files into it. That subfolder can itself have subfolders if needed.

---

## Code Style Rules

- **Named exports only.** No default exports anywhere.
- **`import type { ... }`** for type-only imports.
- **`readonly`** on all interface properties and where possible on class properties.
- **`Object.freeze()`** for immutable data structures.
- **JSDoc** on all public API surfaces (classes, methods, interfaces, functions).
- **No inline comments** in implementation code unless absolutely necessary.
- **No `var`** — use `const` or `let`.
- **No `any`** — use `unknown` or specific types.
- **No business logic** in barrel `index.ts` files.
- **`async/await`** exclusively for asynchronous operations.
- **`.js` extensions** on all relative imports (ESM requirement).

---

## Naming Conventions

| Element | Convention | Example |
|---------|-----------|---------|
| Classes | PascalCase | `EventBus`, `ConfigManager` |
| Interfaces | PascalCase (no `I` prefix) | `EventHandler`, `AuthProvider` |
| Types | PascalCase | `EventPayload`, `ConfigSchema` |
| Enums | PascalCase members | `ErrorCode.NOT_FOUND` |
| Functions | camelCase | `createEventBus()`, `validateConfig()` |
| Variables | camelCase | `eventHandler`, `configStore` |
| Constants | camelCase or UPPER_SNAKE for true constants | `MAX_RETRIES`, `defaultOptions` |
| Private fields | `private readonly` preferred | `private readonly store` |
| File names | Dot notation (see above) | `http.error.ts` |

---

## Architecture Principles

### Interface-First Design
Define the interface before the implementation. Consumers depend on interfaces, not concrete classes.

### DI Container
Token-based registration (string, symbol, or class tokens). Never bypass the container for dependency resolution.

### Configuration
Layered source pattern with priority ordering. Never hardcode configuration values. Sensitive values are auto-redacted.

### Execution Context
Uses `AsyncLocalStorage`. Never pass context manually through deep call chains — use `ContextProvider`.

### Errors
- Use the shared `@lattice/errors` package (`BaseError`, error codes, error categories).
- Domain-specific error classes may live in their package but should extend `BaseError`.
- Never expose internal error details (stack traces, codes) in user-facing responses.

### Lifecycle
State machine pattern. Never mutate lifecycle state directly — use the provided methods.

### Events
Middleware pipeline pattern. Handlers are registered on the emitter (not the registry). The bus wraps publish with middleware execution.

---

## License

- All packages use the MIT License.
- The `LICENSE` file is at the project root.
- Every `package.json` must include `"license": "MIT"`.
- No additional license headers are needed in source files.

---

## Security Rules

- Never hardcode secrets, tokens, passwords, or credentials.
- Use environment variables for all sensitive configuration.
- Configuration values matching sensitive patterns (password, secret, token, api_key) are auto-redacted.
- Flag any auth-adjacent code changes immediately.

---

## Testing Requirements

- **Framework:** Vitest
- **Unit tests:** `packages/<name>/tests/`
- **Integration tests:** `tests/integration/`
- **All new code MUST include unit tests.**
- Tests run via: `../../node_modules/.bin/vitest run` (from package dir)

---

## Import Order

```typescript
// 1. Node.js built-ins
import { randomBytes } from "node:crypto";

// 2. External packages
import { z } from "zod";

// 3. Shared @lattice/* packages
import { BaseError, ErrorCode } from "@lattice/errors.js";

// 4. Internal imports (same package, with .js extension)
import { createEventBus } from "./eventBus/index.js";
```

---

## Agent-Specific Instructions

### Refactoring Agent
- When splitting files, keep the public API surface in the barrel `index.ts`.
- Ensure all imports across the monorepo are updated after a rename/move.
- Run `npm run build` after every structural change.
- Never leave orphaned files — delete empty/unused files.
- **Check shared packages first** before adding new utilities to a consuming package.

### Developer Agent
- Always check file line count before committing. If > 150 lines, split.
- Always check folder file count. If > 5 files, create a subfolder.
- Always use dot notation for new file names.
- Always add `index.ts` barrel with JSDoc when creating a new folder.
- Always run typecheck before committing: `npm run --workspace=@lattice/<pkg> typecheck`
- **Before writing new code**, check if `@lattice/errors`, `@lattice/validation`, or other shared packages already have what you need.

### PR Reviewer
- 🔴 Critical: Changes to error hierarchy, DI container, lifecycle state machine.
- 🟡 Should Fix: Files > 150 lines, folders > 5 files, wrong naming convention, duplicated functionality.
- 🟢 Nice to Have: Missing JSDoc, missing tests, missing barrel exports.

---

## Package Summary

| Package | Purpose | Version | Status |
|---------|---------|---------|--------|
| `@lattice/errors` | Shared error base class and utilities | 0.1.0 | ✅ Built |
| `@lattice/logger` | Structured logging with transports | 0.1.0 | ✅ Built |
| `@lattice/crypto` | Cryptographic primitives | 0.1.0 | ✅ Built |
| `@lattice/events` | Event bus, emitter, middleware, registry | 0.1.0 | ✅ Built |
| `@lattice/config` | Layered configuration with sources | 0.1.0 | ✅ Built |
| `@lattice/container` | DI container with token-based registration | 0.1.0 | ✅ Built |
| `@lattice/core` | Lifecycle, context, runtime, modules | 0.1.0 | ✅ Built |
| `@lattice/validation` | Schema validation with Zod | 0.1.0 | ✅ Built |
| `@lattice/cqrs` | Command query responsibility segregation | 0.1.0 | ✅ Built |
