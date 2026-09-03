# Architecture

## Package Tiers

Zudo packages are organized into dependency tiers. Dependencies flow inward — higher-tier packages may depend on lower-tier packages, but never the reverse.

### Tier 0 — Leaf

No `@zudo/*` dependencies.

- `@zudo/errors` — BaseError, ErrorCode, error categories
- `@zudo/types` — type guards, utility types

### Tier 1 — Foundation

Depends only on Tier 0.

- `@zudo/constants` — shared constants and branded types
- `@zudo/container` — DI container
- `@zudo/logger` — structured logging
- `@zudo/crypto` — cryptographic primitives
- `@zudo/validation` — schema validation
- `@zudo/schema` — schema definitions
- `@zudo/config` — layered configuration
- `@zudo/middleware` — composable middleware
- `@zudo/serialization` — JSON serializer and transformers
- `@zudo/events` — event bus, emitter, middleware, registry
- `@zudo/messaging` — message bus
- `@zudo/lifecycle` — lifecycle orchestration
- `@zudo/transactions` — transaction coordination
- `@zudo/permissions` — RBAC/ABAC
- `@zudo/feature-flags` — feature flag evaluation
- `@zudo/plugins` — plugin manager
- `@zudo/security` — input validation, CORS, CSRF, rate limiting
- `@zudo/tenancy` — multi-tenant context
- `@zudo/docs` — documentation infrastructure
- `@zudo/cache` — cache abstraction
- `@zudo/storage` — storage abstraction
- `@zudo/adapters` — boundary to external platforms
- `@zudo/queue` — background jobs
- `@zudo/scheduler` — scheduling
- `@zudo/database` — DB infrastructure
- `@zudo/observability` — metrics/tracing

### Tier 2 — Application

Depends on Tier 1.

- `@zudo/core` — application lifecycle, execution context, runtime
- `@zudo/cqrs` — commands/queries/handlers
- `@zudo/auth` — JWT/sessions/RBAC
- `@zudo/runtime` — lifecycle orchestrator
- `@zudo/openapi` — OpenAPI generation
- `@zudo/rpc` — RPC
- `@zudo/api` — API framework

### Tier 3 — Transport

Depends on Tier 2.

- `@zudo/http` — HTTP primitives, routing, middleware
- `zudo-cli` — CLI scaffolding/generators

### Tier 4 — Developer Experience

- `@zudo/testing` — test helpers

## Rules

- No package may depend on a higher-tier package.
- All internal imports must use `.js` extensions.
- All packages must use `workspace:*` for internal dependencies.
- Every folder must have an `index.ts` barrel.
- Maximum 5 files per folder (excluding `index.ts`).
- Maximum 150 lines per file.
