# AGENTS.md — Lattice Framework

> Coding conventions and agent instructions for the Lattice framework.
> Every agent reads this file before doing any work.

---

## Project Overview

Lattice is a TypeScript modular application framework (npm workspaces monorepo) with DI container, layered configuration, lifecycle management, execution context propagation, structured logging, cryptography, validation, and event systems.

## Stack

- **Language:** TypeScript 7.x (strict mode)
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
| Validation schemas | `@lattice/validation` (constraints, parsers, composers, circular detection, depth/size checks) | Creating ad-hoc validation logic |
| Logging | `@lattice/logger` (createLogger, transports) | `console.log` or custom loggers |
| Crypto | `@lattice/crypto` (hashing, encryption, tokens) | Using `crypto` directly without wrappers |
| Auth | `@lattice/auth` (JWT, sessions, RBAC, passwords) | Re-implementing auth logic |
| Middleware | `@lattice/middleware` (composition, pipelines) | Custom middleware chaining |
| Constants & enums | `@lattice/constants` (HTTP, env, time, branded types, serialization tags, patterns) | Re-defining constants locally |
| Type guards & utilities | `@lattice/types` (`isPlainObject`, `isDate`, `isEmail`, `DeepReadonly`, `Maybe`, converters) | Creating ad-hoc type utilities |
| Events | `@lattice/events` (EventBus, middleware) | Custom event emitters |
| Messaging | `@lattice/messaging` (MessageBus, handlers, middleware) | Custom message buses |
| Background jobs | `@lattice/queue` (Queue, Worker, Processor, Job) | Custom job infrastructure |
| Config | `@lattice/config` (sources, resolvers) | Hardcoding configuration |
| DI | `@lattice/container` (tokens, registration) | Manual dependency wiring |
| Serialization | `@lattice/serialization` (JSON serializer, type transformers, envelopes, registry) | `JSON.stringify`/`JSON.parse` directly, custom serialization logic |
| Schema | `@lattice/schema` (schema definition, parsing, type inference, validation contracts) | Creating ad-hoc schema definitions or validation logic |
| Lifecycle | `@lattice/lifecycle` (state machine, dependency ordering, graceful shutdown, rollback, signals) | Custom startup/shutdown logic |

| Security | `@lattice/security` (input validation, header security, CORS, CSRF, rate limiting) | Custom security logic |
| Permissions | `@lattice/permissions` (RBAC, ABAC, resource authorization, wildcards, policies, abilities) | Re-implementing authorization logic |
| Transactions | `@lattice/transactions` (lifecycle, context propagation, savepoints, hooks, adapter abstraction) | Custom transaction management |
| Tenancy | `@lattice/tenancy` (tenant resolution, context propagation, resolver chains, guard middleware) | Custom multi-tenant logic |
| Feature Flags | `@lattice/feature-flags` (flag evaluation, deterministic rollouts, rule engine, providers) | Custom feature flag logic |
| HTTP | `@lattice/http` (request handling, routing, middleware) | Custom HTTP abstractions |
| Observability | `@lattice/observability` (metrics, tracing, context propagation) | Custom telemetry |
| Storage | `@lattice/storage` (database, cache, object storage abstractions) | Custom storage abstractions |
| Runtime | `@lattice/runtime` (lifecycle, dependency ordering, signals) | Custom startup/shutdown logic |
| CQRS | `@lattice/cqrs` (commands, queries, handlers) | Custom command/query infrastructure |
| Database | `@lattice/database` (clients, repositories, transactions) | Direct database driver usage |
| Cache | `@lattice/cache` (adapters, tags, locking) | Custom caching logic |
| Testing | `@lattice/testing` (helpers, fixtures, mocks) | Ad-hoc test utilities |

### Rule: Types Must Be Imported From the Owning Package

**CRITICAL: Before defining ANY type, interface, or type alias in a new package, check if it already exists in a shared package.**

| Type Need | Import From | Never |
|-----------|-------------|-------|
| ID types (`EventId`, `UserId`, `CorrelationId`, etc.) | `@lattice/constants` (branded types) | Redefining `type EventId = string` |
| Timestamp types | `@lattice/constants` (`Timestamp`) | Creating local `type MessageTimestamp = Date` |
| Error types | `@lattice/errors` | Creating `class MyError extends Error` |
| Cache-related types | `@lattice/cache` (if published) | Redefining `CacheOperation` |
| Logger context types | `@lattice/logger` | Re-defining logger context interfaces |
| Middleware types | `@lattice/middleware` | Re-defining middleware signatures |
| Event types | `@lattice/events` | Re-defining event handler interfaces |
| Validation types | `@lattice/validation` | Re-defining schema types |
| Type guards | `@lattice/types` | Writing ad-hoc `isXxx()` functions |
| Utility types (`Maybe`, `DeepReadonly`, etc.) | `@lattice/types` | Redefining `type Maybe<T> = T | null | undefined` |

**When a type already exists in a shared package, ALL consuming packages must import it from there.**

Example of WRONG (duplicated):
```typescript
// ❌ In messaging package
export type MessageId = string;

// ❌ In events package  
export type EventId = string; // Already exists in @lattice/constants!
```

Example of CORRECT:
```typescript
// ✅ In messaging package
import type { EntityId } from "@lattice/constants";
export type MessageId = EntityId; // Or re-export if needed

// ✅ In events package
import type { EventId } from "@lattice/constants";
// Use EventId from constants, don't redefine it
```

### Rule: If Missing, Add to the Shared Package

If you need functionality that **should** exist in a shared package but doesn't:

1. **Check** if the shared package has the feature (search its `src/` directory)
2. **If not**, add it to the shared package (not to your current package)
3. **Import** it from the shared package in your current package
4. **Never** create a duplicate implementation in a consuming package

### Rule: Package Dependency Direction

```
errors, constants ← (leaf packages, no internal dependencies)
    ↑
container, logger, events, crypto, validation, schema, config, messaging, types, middleware, queue
    ↑
cqrs (depends on messaging, events)
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
- **ALL error types MUST live in `@lattice/errors`.** No package should create its own error classes that extend `BaseError` or `Error`.
- `@lattice/errors` already has errors for every domain: `ContainerError`, `ModuleError`, `RuntimeError`, `EventError`, `LoggingError`, `MiddlewareError`, `ConfigurationError`, `AuthenticationError`, `AuthorizationError`, `CryptoError`, `DatabaseError`, `StorageError`, `NetworkError`, `ServiceError`, `ExternalServiceError`, `TimeoutError`, `HttpError`, `RateLimitError`, `ValidationError`, `ConflictError`, `NotFoundError`, `ApplicationError`, `DomainError`, etc.
- When a package needs an error, **check `@lattice/errors` first** — it likely already exists.
- If the error genuinely doesn't exist in `@lattice/errors`, **add it there** (in the appropriate subfolder), then import from `@lattice/errors` in your package.
- **Never** create a local error class that extends `Error` or `BaseError` inside a consuming package.
- Packages may keep lightweight wrapper classes (e.g. `ConfigManagerValidationError extends ConfigurationError`) for package-specific context, but the base error must come from `@lattice/errors`.
- Never expose internal error details (stack traces, codes) in user-facing responses.

### Lifecycle
State machine pattern. Never mutate lifecycle state directly — use the provided methods.

### Events
Middleware pipeline pattern. Handlers are registered on the emitter (not the registry). The bus wraps publish with middleware execution.

---

## Type Ownership Table

This table defines which package OWNS each type. All consuming packages must import from the owner.

| Type | Owner Package | Consumers Import From |
|------|---------------|----------------------|
| `EntityId`, `UserId`, `EventId`, `RequestId`, `CorrelationId`, `SessionId`, `TenantId` | `@lattice/constants` | `import type { EventId } from "@lattice/constants"` |
| `Timestamp`, `Brand<>` | `@lattice/constants` | `import type { Timestamp } from "@lattice/constants"` |
| `BaseError`, `ApplicationError`, `DomainError`, all error classes | `@lattice/errors` | `import { ApplicationError } from "@lattice/errors"` |
| `ErrorCode`, `ErrorCategory` | `@lattice/errors` | `import { ErrorCode } from "@lattice/errors"` |
| `Logger`, `LogRecord`, `LogLevel`, `LogTransport` | `@lattice/logger` | `import type { Logger } from "@lattice/logger"` |
| `EventBus`, `EventHandler`, `EventPayload` | `@lattice/events` | `import type { EventBus } from "@lattice/events"` |
| `MessageBus`, `MessageHandler`, `MessageId` | `@lattice/messaging` | `import type { MessageBus } from "@lattice/messaging"` |
| `Middleware`, `MiddlewareContext` | `@lattice/middleware` | `import type { Middleware } from "@lattice/middleware"` |
| `Container`, `Token`, `Provider` | `@lattice/container` | `import type { Container } from "@lattice/container"` |
| `ConfigSource`, `ConfigResolver` | `@lattice/config` | `import type { ConfigSource } from "@lattice/config"` |
| `CacheAdapter`, `CacheStore`, `CacheKey` | `@lattice/cache` | `import type { CacheAdapter } from "@lattice/cache"` |
| `Observability`, `Tracer`, `Span`, `MetricsRegistry` | `@lattice/observability` | `import type { Tracer } from "@lattice/observability"` |
| `Schema`, `SchemaResult`, `SchemaIssue`, `SchemaParseOptions` | `@lattice/schema` | `import type { Schema } from "@lattice/schema"` |
| `ValidationResult` | `@lattice/validation` | `import type { ValidationResult } from "@lattice/validation"` |
| `Maybe`, `DeepReadonly`, `Prettify`, type guards (`isPlainObject`, `isDate`), converters | `@lattice/types` | `import { isPlainObject } from "@lattice/types"` |
| `Serializer`, `TypeTransformer`, `TransformerRegistry`, `SerializationFormat`, `SerializedEnvelope` | `@lattice/serialization` | `import type { Serializer } from "@lattice/serialization"` |
| `LifecycleComponent`, `LifecycleManager`, `LifecycleState`, `LifecyclePhase`, `LifecycleContext`, `LifecycleRegistry` | `@lattice/lifecycle` | `import type { LifecycleComponent } from "@lattice/lifecycle"` |
| `SerializationTags`, `SerializationLimits`, `SerializationFormat` (constants) | `@lattice/constants` | `import { SerializationTags } from "@lattice/constants"` |
| `PermissionEngine`, `PermissionRule`, `PermissionActor`, `RoleDefinition`, `PermissionDecision`, `PermissionString` | `@lattice/permissions` | `import { createPermissionEngine } from "@lattice/permissions"` |
| `Transaction`, `TransactionManager`, `TransactionState`, `TransactionOptions`, `TransactionAdapter` | `@lattice/transactions` | `import { createTransactionManager } from "@lattice/transactions"` |
| `Tenant`, `TenantId`, `TenantContext`, `TenantResolver`, `TenantRepository`, `TenantContextStorage` | `@lattice/tenancy` | `import { createTenantContextManager } from "@lattice/tenancy"` |
| `FeatureFlag`, `FeatureFlagContext`, `FeatureFlagProvider`, `FeatureFlagEvaluation`, `FeatureFlagRule` | `@lattice/feature-flags` | `import { createFeatureFlags } from "@lattice/feature-flags"` |

### Type Import Decision Tree

When you need a type:

1. **Is it an error type?** → Import from `@lattice/errors`
2. **Is it an ID type (UserId, EventId, etc.)?** → Import from `@lattice/constants`
3. **Is it a logger/transport type?** → Import from `@lattice/logger`
4. **Is it an event type?** → Import from `@lattice/events`
5. **Is it a message type?** → Import from `@lattice/messaging`
6. **Is it a middleware type?** → Import from `@lattice/middleware`
7. **Is it a type guard or utility type?** → Import from `@lattice/types`
8. **Is it a validation type (circular, depth, size)?** → Import from `@lattice/validation`
9. **Is it a serialization type?** → Import from `@lattice/serialization`
10. **Is it a constant or enum?** → Import from `@lattice/constants`
11. **Is it a security primitive?** → Import from `@lattice/security`
12. **Is it a lifecycle type?** → Import from `@lattice/lifecycle`
13. **Is it package-specific?** → Define it in that package
14. **Still unsure?** → Check with `grep -r "type.*YourType" packages/*/src`

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
- **Use `@lattice/security`** for all security primitives: input validation, header security, URL normalization, CORS, CSRF, rate limiting, and security headers.
- **Never implement custom security logic** when `@lattice/security` provides it.
- **Always use secure defaults**: HttpOnly, Secure, SameSite=Lax for cookies; DENY for X-Frame-Options; nosniff for X-Content-Type-Options.
- **Rate limit all public endpoints** using `createRateLimiter` from `@lattice/security`.
- **Validate all external input** using `sanitizeString`, `sanitizeObject`, `containsSqlInjection`, `containsXss` from `@lattice/security`.

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
- **BEFORE refactoring a large file:** Read and understand the entire file first. Create the new split files while keeping the original file intact. Only delete the original file AFTER all new files are created, verified, and the barrel `index.ts` is updated to export from the new locations.
- **Refactoring safety order:** (1) Read and understand the full file, (2) Create new split files with correct content, (3) Update barrel `index.ts` to export from new locations, (4) Verify typecheck passes, (5) Verify tests pass, (6) THEN delete the original file.
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
- **Before writing new code**, check if `@lattice/errors`, `@lattice/validation`, `@lattice/types`, `@lattice/constants`, or other shared packages already have what you need.
- **Before defining a type**, search ALL shared packages for existing types: `grep -r "type.*TypeName\|interface.*TypeName" packages/*/src --include="*.type.ts"`
- **Never create a local type that duplicates a shared type.** Import from the owning package instead.
- **When unsure about type ownership**, check the Type Ownership Table below.

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
| `@lattice/auth` | Authentication — JWT, sessions, password hashing; delegates RBAC to `@lattice/permissions` | 0.1.0 | ✅ Built |
| `@lattice/middleware` | Composable middleware pipeline (composition, timing, error handling) | 0.1.0 | ✅ Built |
| `@lattice/constants` | Shared constants, enums, and type-safe literals | 0.1.0 | ✅ Built |
| `@lattice/types` | Shared type guards, utility types, and type converters | 0.1.0 | ✅ Built |
| `@lattice/messaging` | In-process message bus infrastructure | 0.1.0 | ✅ Built |
| `@lattice/queue` | Background job and asynchronous task infrastructure | 0.1.0 | ✅ Built |
| `@lattice/cli` | Command-line interface for the Lattice framework | 0.1.0 | ✅ Built |
| `@lattice/database` | Database infrastructure, clients, repositories, transactions | 0.1.0 | ✅ Built |
| `@lattice/http` | HTTP primitives, request handling, routing, middleware | 0.1.0 | ✅ Built |
| `@lattice/cache` | Cache abstraction with memory adapter, tags, locking, metrics | 0.1.0 | ✅ Built |
| `@lattice/observability` | Structured logging, metrics, tracing, context propagation, exporters | 0.1.0 | ✅ Built |
| `@lattice/security` | Input validation, header security, URL normalization, CORS, CSRF, rate limiting, security headers | 0.1.0 | ✅ Built |
| `@lattice/storage` | Database, object storage, repository, serialization, locking, and lifecycle abstractions | 0.1.0 | ✅ Built |
| `@lattice/runtime` | Application lifecycle orchestrator with dependency ordering, rollback, signals, and readiness | 0.1.0 | ✅ Built |
| `@lattice/serialization` | Data translation layer — JSON serializer, type transformers, envelopes, registry | 0.1.0 | ✅ Built |
| `@lattice/schema` | Schema definition and parsing engine — type-safe data contracts with validation, transformation, type inference | 0.1.0 | ✅ Built |
| `@lattice/lifecycle` | Application and component lifecycle orchestration — state machine, dependency ordering, graceful shutdown, rollback, signals | 0.1.0 | ✅ Built |
| `@lattice/adapters` | Boundary layer between Lattice and external platforms — adapter contracts, registry, capabilities, transport abstractions | 0.1.0 | ✅ Built |
| `@lattice/permissions` | Generic authorization engine — RBAC, ABAC, resource authorization, wildcards, role hierarchy, policies, abilities, caching, explain mode | 0.1.0 | ✅ Built |
| `@lattice/transactions` | Transaction lifecycle and coordination — state machine, AsyncLocalStorage context, propagation, savepoints, hooks, adapter abstraction | 0.1.0 | ✅ Built |
| `@lattice/tenancy` | Multi-tenant context and isolation — tenant resolution, AsyncLocalStorage propagation, resolver chains, trust levels, guard middleware | 0.1.0 | ✅ Built |
| `@lattice/feature-flags` | Feature flag system — deterministic rollouts, rule engine, providers, variants, snapshots, evaluation context | 0.1.0 | ✅ Built |
