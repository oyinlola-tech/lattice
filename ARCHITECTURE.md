# Lattice Framework — Architecture & Package Dependencies

> This document defines the canonical package dependency map for the Lattice framework.
> It is the single source of truth for allowed cross-package imports.

---

## 1. Design Principle

**Dependencies flow inward.**

Foundation packages have no @lattice dependencies.
Higher-level packages may depend on lower-level packages.
No package may depend on a package in a higher tier.

```
Foundation → Runtime Primitives → Application Architecture → Infrastructure Abstractions → Transport → Developer Experience
```

---

## 2. Package Tiers

### Tier 0 — Leaf (no @lattice dependencies)

These packages depend on nothing except Node.js built-ins and external libraries.

| Package | Purpose |
|---------|---------|
| `@lattice/errors` | Shared error base class, error codes, error categories |
| `@lattice/types` | Type guards, utility types, converters |

**Rules:**
- Must not import from any other `@lattice/*` package.
- External dependencies only.

---

### Tier 1 — Foundation

Depends only on Tier 0.

| Package | Depends On | Purpose |
|---------|-----------|---------|
| `@lattice/constants` | errors | Branded IDs, enums, serialization constants |
| `@lattice/container` | errors | DI container with token-based registration |
| `@lattice/logger` | errors | Structured logging with transports |
| `@lattice/crypto` | errors | Hashing, encryption, tokens |
| `@lattice/validation` | errors | Schema validation with Zod |
| `@lattice/schema` | errors, constants, types | Schema definition, parsing, type inference |
| `@lattice/config` | errors | Layered configuration with sources |
| `@lattice/middleware` | errors | Composable middleware pipeline |
| `@lattice/serialization` | errors, constants, types, validation | JSON serializer, type transformers, envelopes |
| `@lattice/events` | errors, constants | Event bus, emitter, middleware, registry |
| `@lattice/messaging` | errors, constants | In-process message bus |
| `@lattice/lifecycle` | errors, constants | State machine, dependency ordering, graceful shutdown |
| `@lattice/transactions` | errors | Transaction lifecycle, AsyncLocalStorage context |
| `@lattice/permissions` | errors, constants | RBAC, ABAC, resource authorization |
| `@lattice/feature-flags` | errors | Feature flag evaluation, rule engine |
| `@lattice/plugins` | errors, constants, types | Plugin registration, lifecycle, orchestration |
| `@lattice/security` | errors, constants | Input validation, CORS, CSRF, rate limiting |
| `@lattice/tenancy` | errors, constants | Multi-tenant context and isolation |
| `@lattice/docs` | errors | Documentation infrastructure |
| `@lattice/cache` | errors, types, serialization | Cache abstraction with memory adapter |
| `@lattice/storage` | errors, constants, types, serialization | Database, object storage, repository abstractions |
| `@lattice/adapters` | errors, constants, types, lifecycle | Adapter contracts, registry, transport abstractions |
| `@lattice/queue` | errors, constants, serialization | Background job and async task infrastructure |
| `@lattice/scheduler` | errors, constants, types | Job scheduling, cron, triggers |

**Rules:**
- May import from Tier 0 only.
- Must not import from any Tier 2+ package.
- Peer dependencies on higher-tier packages are allowed only when explicitly documented.

---

### Tier 2 — Application Architecture

Depends on Tier 0 + Tier 1.

| Package | Depends On | Purpose |
|---------|-----------|---------|
| `@lattice/core` | errors, constants, messaging | Lifecycle, context, runtime, modules |
| `@lattice/cqrs` | errors, events, messaging | Commands, queries, handlers |
| `@lattice/auth` | errors, constants, permissions | JWT, sessions, password hashing |
| `@lattice/runtime` | errors, constants, container, config, logger, events, core | Application lifecycle orchestrator |
| `@lattice/openapi` | errors, constants, schema | OpenAPI document generation |
| `@lattice/rpc` | errors, constants, types, schema | RPC primitives |
| `@lattice/api` | errors, constants, types, schema | API abstraction layer |

**Rules:**
- May import from Tier 0 and Tier 1 only.
- Must not import from Tier 3+ packages.
- Must not import from transport packages (`http`, `rpc`, `api`, `openapi`) unless explicitly documented.

---

### Tier 3 — Transport

Depends on Tier 0 + Tier 1 + Tier 2.

| Package | Depends On | Purpose |
|---------|-----------|---------|
| `@lattice/http` | core, errors, logger, security | HTTP request handling, routing, middleware |
| `@lattice/cli` | config, core, errors, logger | Command-line interface |

**Rules:**
- May import from Tier 0, Tier 1, and Tier 2 only.
- Must not import from other transport packages (`http` must not import from `rpc`, `api`, `openapi`).
- Transport packages translate external requests into internal application calls.

---

### Tier 4 — Developer Experience

Depends on any tier.

| Package | Depends On | Purpose |
|---------|-----------|---------|
| `@lattice/testing` | many | Test helpers, fixtures, mocks |
| `@lattice/docs` | errors | Documentation generation |

**Rules:**
- May import from any package.
- Must not be imported by production runtime packages (testing only).

---

## 3. Complete Dependency Graph

```
Tier 0: errors, types
    │
    ▼
Tier 1: constants, container, logger, crypto, validation, schema,
        config, middleware, serialization, events, messaging,
        lifecycle, transactions, permissions, feature-flags,
        plugins, security, tenancy, docs, cache, storage,
        adapters, queue, scheduler
    │
    ▼
Tier 2: core, cqrs, auth, runtime, openapi, rpc, api
    │
    ▼
Tier 3: http, cli
    │
    ▼
Tier 4: testing, docs
```

---

## 4. Forbidden Dependency Patterns

These patterns must **never** occur:

| Pattern | Reason |
|---------|--------|
| `errors → @lattice/*` | Leaf package must stay leaf |
| `constants → @lattice/*` | Leaf package must stay leaf |
| `types → @lattice/*` | Leaf package must stay leaf |
| `core → http` | Core must not know about transport |
| `core → rpc` | Core must not know about transport |
| `cqrs → http` | CQRS must not know about transport |
| `events → http` | Events must not know about transport |
| `http → rpc` | Transport packages must not depend on each other |
| `http → api` | Transport packages must not depend on each other |
| `rpc → http` | Transport packages must not depend on each other |
| `runtime → http` | Runtime must not know about specific transports |

---

## 5. Peer Dependencies

Peer dependencies are allowed only when:
1. The dependency is in a higher or equal tier.
2. The dependency is truly optional (the package functions without it).
3. The peer dependency is explicitly documented.

Current peer dependencies:
- `@lattice/permissions` → peer `@lattice/http` (optional)
- `@lattice/tenancy` → peer `@lattice/http` (optional)

---

## 6. Package Versioning

All packages use `0.1.0`.
Internal `@lattice/*` dependencies must use exact versions (`0.1.0`), not wildcards (`*`).

---

## 7. Enforcement

This document is enforced by:
- `npm run architect:check` — runs a script that validates no forbidden dependencies exist.
- CI must pass `architect:check` before merging.

---

## 8. Implementation Order

Packages should be built and tested in tier order:

1. Tier 0: `errors`, `types`
2. Tier 1: `constants`, `container`, `logger`, `crypto`, `validation`, `schema`, `config`, `middleware`, `serialization`, `events`, `messaging`, `lifecycle`, `transactions`, `permissions`, `feature-flags`, `plugins`, `security`, `tenancy`, `docs`, `cache`, `storage`, `adapters`, `queue`, `scheduler`
3. Tier 2: `core`, `cqrs`, `auth`, `runtime`, `openapi`, `rpc`, `api`
4. Tier 3: `http`, `cli`
5. Tier 4: `testing`

---

## 9. Vertical Slices

After Tier 0-1 are stable, build integration examples:
- `examples/hello-world` — minimal HTTP server
- `examples/basic-api` — CRUD with CQRS, database, events
- `examples/cqrs` — command/query separation
- `examples/events` — event-driven architecture
- `examples/modules` — modular monolith

These examples validate that packages work together correctly.
