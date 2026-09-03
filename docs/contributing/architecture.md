# Architecture

## Package Tiers

Zudolib packages are organized into dependency tiers. Dependencies flow inward — higher-tier packages may depend on lower-tier packages, but never the reverse.

### Tier 0 — Leaf

No `@zudolib/*` dependencies.

- `@zudolib/errors` — BaseError, ErrorCode, error categories
- `@zudolib/types` — type guards, utility types

### Tier 1 — Foundation

Depends only on Tier 0.

- `@zudolib/constants` — shared constants and branded types
- `@zudolib/container` — DI container
- `@zudolib/logger` — structured logging
- `@zudolib/crypto` — cryptographic primitives
- `@zudolib/validation` — schema validation
- `@zudolib/schema` — schema definitions
- `@zudolib/config` — layered configuration
- `@zudolib/middleware` — composable middleware
- `@zudolib/serialization` — JSON serializer and transformers
- `@zudolib/events` — event bus, emitter, middleware, registry
- `@zudolib/messaging` — message bus
- `@zudolib/lifecycle` — lifecycle orchestration
- `@zudolib/transactions` — transaction coordination
- `@zudolib/permissions` — RBAC/ABAC
- `@zudolib/feature-flags` — feature flag evaluation
- `@zudolib/plugins` — plugin manager
- `@zudolib/security` — input validation, CORS, CSRF, rate limiting
- `@zudolib/tenancy` — multi-tenant context
- `@zudolib/docs` — documentation infrastructure
- `@zudolib/cache` — cache abstraction
- `@zudolib/storage` — storage abstraction
- `@zudolib/adapters` — boundary to external platforms
- `@zudolib/queue` — background jobs
- `@zudolib/scheduler` — scheduling
- `@zudolib/database` — DB infrastructure
- `@zudolib/observability` — metrics/tracing

### Tier 2 — Application

Depends on Tier 1.

- `@zudolib/core` — application lifecycle, execution context, runtime
- `@zudolib/cqrs` — commands/queries/handlers
- `@zudolib/auth` — JWT/sessions/RBAC
- `@zudolib/runtime` — lifecycle orchestrator
- `@zudolib/openapi` — OpenAPI generation
- `@zudolib/rpc` — RPC
- `@zudolib/api` — API framework

### Tier 3 — Transport

Depends on Tier 2.

- `@zudolib/http` — HTTP primitives, routing, middleware
- `zudolib-cli` — CLI scaffolding/generators

### Tier 4 — Developer Experience

- `@zudolib/testing` — test helpers

## Rules

- No package may depend on a higher-tier package.
- All internal imports must use `.js` extensions.
- All packages must use `workspace:*` for internal dependencies.
- Every folder must have an `index.ts` barrel.
- Maximum 5 files per folder (excluding `index.ts`).
- Maximum 150 lines per file.
