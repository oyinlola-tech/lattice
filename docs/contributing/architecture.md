# Architecture

## Package Tiers

Zudolib packages are organized into dependency tiers. Dependencies flow inward — higher-tier packages may depend on lower-tier packages, but never the reverse.

### Tier 0 — Leaf

No `@zudoliblib/*` dependencies.

- `@zudoliblib/errors` — BaseError, ErrorCode, error categories
- `@zudoliblib/types` — type guards, utility types

### Tier 1 — Foundation

Depends only on Tier 0.

- `@zudoliblib/constants` — shared constants and branded types
- `@zudoliblib/container` — DI container
- `@zudoliblib/logger` — structured logging
- `@zudoliblib/crypto` — cryptographic primitives
- `@zudoliblib/validation` — schema validation
- `@zudoliblib/schema` — schema definitions
- `@zudoliblib/config` — layered configuration
- `@zudoliblib/middleware` — composable middleware
- `@zudoliblib/serialization` — JSON serializer and transformers
- `@zudoliblib/events` — event bus, emitter, middleware, registry
- `@zudoliblib/messaging` — message bus
- `@zudoliblib/lifecycle` — lifecycle orchestration
- `@zudoliblib/transactions` — transaction coordination
- `@zudoliblib/permissions` — RBAC/ABAC
- `@zudoliblib/feature-flags` — feature flag evaluation
- `@zudoliblib/plugins` — plugin manager
- `@zudoliblib/security` — input validation, CORS, CSRF, rate limiting
- `@zudoliblib/tenancy` — multi-tenant context
- `@zudoliblib/docs` — documentation infrastructure
- `@zudoliblib/cache` — cache abstraction
- `@zudoliblib/storage` — storage abstraction
- `@zudoliblib/adapters` — boundary to external platforms
- `@zudoliblib/queue` — background jobs
- `@zudoliblib/scheduler` — scheduling
- `@zudoliblib/database` — DB infrastructure
- `@zudoliblib/observability` — metrics/tracing

### Tier 2 — Application

Depends on Tier 1.

- `@zudoliblib/core` — application lifecycle, execution context, runtime
- `@zudoliblib/cqrs` — commands/queries/handlers
- `@zudoliblib/auth` — JWT/sessions/RBAC
- `@zudoliblib/runtime` — lifecycle orchestrator
- `@zudoliblib/openapi` — OpenAPI generation
- `@zudoliblib/rpc` — RPC
- `@zudoliblib/api` — API framework

### Tier 3 — Transport

Depends on Tier 2.

- `@zudoliblib/http` — HTTP primitives, routing, middleware
- `zudolib-cli` — CLI scaffolding/generators

### Tier 4 — Developer Experience

- `@zudoliblib/testing` — test helpers

## Rules

- No package may depend on a higher-tier package.
- All internal imports must use `.js` extensions.
- All packages must use `workspace:*` for internal dependencies.
- Every folder must have an `index.ts` barrel.
- Maximum 5 files per folder (excluding `index.ts`).
- Maximum 150 lines per file.
