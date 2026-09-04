# Architecture

## Package Tiers

Zudojs packages are organized into dependency tiers. Dependencies flow inward — higher-tier packages may depend on lower-tier packages, but never the reverse.

### Tier 0 — Leaf

No `@zudojs/*` dependencies.

- `@zudojs/errors` — BaseError, ErrorCode, error categories
- `@zudojs/types` — type guards, utility types

### Tier 1 — Foundation

Depends only on Tier 0.

- `@zudojs/constants` — shared constants and branded types
- `@zudojs/container` — DI container
- `@zudojs/logger` — structured logging
- `@zudojs/crypto` — cryptographic primitives
- `@zudojs/validation` — schema validation
- `@zudojs/schema` — schema definitions
- `@zudojs/config` — layered configuration
- `@zudojs/middleware` — composable middleware
- `@zudojs/serialization` — JSON serializer and transformers
- `@zudojs/events` — event bus, emitter, middleware, registry
- `@zudojs/messaging` — message bus
- `@zudojs/lifecycle` — lifecycle orchestration
- `@zudojs/transactions` — transaction coordination
- `@zudojs/permissions` — RBAC/ABAC
- `@zudojs/feature-flags` — feature flag evaluation
- `@zudojs/plugins` — plugin manager
- `@zudojs/security` — input validation, CORS, CSRF, rate limiting
- `@zudojs/tenancy` — multi-tenant context
- `@zudojs/docs` — documentation infrastructure
- `@zudojs/cache` — cache abstraction
- `@zudojs/storage` — storage abstraction
- `@zudojs/adapters` — boundary to external platforms
- `@zudojs/queue` — background jobs
- `@zudojs/scheduler` — scheduling
- `@zudojs/database` — DB infrastructure
- `@zudojs/observability` — metrics/tracing

### Tier 2 — Application

Depends on Tier 1.

- `@zudojs/core` — application lifecycle, execution context, runtime
- `@zudojs/cqrs` — commands/queries/handlers
- `@zudojs/auth` — JWT/sessions/RBAC
- `@zudojs/runtime` — lifecycle orchestrator
- `@zudojs/openapi` — OpenAPI generation
- `@zudojs/rpc` — RPC
- `@zudojs/api` — API framework

### Tier 3 — Transport

Depends on Tier 2.

- `@zudojs/http` — HTTP primitives, routing, middleware
- `zudojs-cli` — CLI scaffolding/generators

### Tier 4 — Developer Experience

- `@zudojs/testing` — test helpers

## Rules

- No package may depend on a higher-tier package.
- All internal imports must use `.js` extensions.
- All packages must use `workspace:*` for internal dependencies.
- Every folder must have an `index.ts` barrel.
- Maximum 5 files per folder (excluding `index.ts`).
- Maximum 150 lines per file.
