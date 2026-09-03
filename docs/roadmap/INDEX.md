# Zudo Roadmap

> This document tracks the implementation status of the Zudo framework.
> It is updated as packages are completed, modified, or deprecated.

---

## Legend

- ✅ **Complete** — Package is implemented, tested, and documented.
- 🔄 **In Progress** — Package is partially implemented.
- ⏳ **Planned** — Package is designed but not yet implemented.
- ❌ **Not Started** — Package is identified but not yet designed.

---

## Phase 1 — Foundation

The foundational layer. These packages have no `@zudolib/*` dependencies (except `@zudolib/errors`).

| Package                  | Status      | Notes                                                  |
| ------------------------ | ----------- | ------------------------------------------------------ |
| `@zudolib/errors`        | ✅ Complete | Shared error base class, error codes, error categories |
| `@zudolib/types`         | ✅ Complete | Type guards, utility types, converters                 |
| `@zudolib/constants`     | ✅ Complete | Branded IDs, enums, serialization constants            |
| `@zudolib/container`     | ✅ Complete | DI container with token-based registration             |
| `@zudolib/logger`        | ✅ Complete | Structured logging with transports                     |
| `@zudolib/crypto`        | ✅ Complete | Hashing, encryption, tokens                            |
| `@zudolib/validation`    | ✅ Complete | Schema validation with Zod                             |
| `@zudolib/schema`        | ✅ Complete | Schema definition, parsing, type inference             |
| `@zudolib/config`        | ✅ Complete | Layered configuration with sources                     |
| `@zudolib/middleware`    | ✅ Complete | Composable middleware pipeline                         |
| `@zudolib/serialization` | ✅ Complete | JSON serializer, type transformers, envelopes          |

**Phase 1 Goal:** Provide the building blocks for all higher-level packages.

---

## Phase 2 — Runtime Primitives

Runtime building blocks that depend on foundation packages.

| Package                  | Status      | Notes                                                 |
| ------------------------ | ----------- | ----------------------------------------------------- |
| `@zudolib/events`        | ✅ Complete | Event bus, emitter, middleware, registry              |
| `@zudolib/messaging`     | ✅ Complete | In-process message bus                                |
| `@zudolib/lifecycle`     | ✅ Complete | State machine, dependency ordering, graceful shutdown |
| `@zudolib/transactions`  | ✅ Complete | Transaction lifecycle, AsyncLocalStorage context      |
| `@zudolib/cache`         | ✅ Complete | Cache abstraction with memory adapter                 |
| `@zudolib/storage`       | ✅ Complete | Database, object storage, repository abstractions     |
| `@zudolib/queue`         | ✅ Complete | Background job and async task infrastructure          |
| `@zudolib/scheduler`     | ✅ Complete | Job scheduling, cron, triggers                        |
| `@zudolib/adapters`      | ✅ Complete | Adapter contracts, registry, transport abstractions   |
| `@zudolib/database`      | ✅ Complete | Database clients, repositories, transactions          |
| `@zudolib/observability` | ✅ Complete | Structured logging, metrics, tracing, exporters       |

**Phase 2 Goal:** Provide the runtime infrastructure for application architecture.

---

## Phase 3 — Application Architecture

Patterns and structures for building applications.

| Package                  | Status      | Notes                                         |
| ------------------------ | ----------- | --------------------------------------------- |
| `@zudolib/core`          | ✅ Complete | Lifecycle, context, runtime, modules          |
| `@zudolib/cqrs`          | ✅ Complete | Commands, queries, handlers                   |
| `@zudolib/auth`          | ✅ Complete | JWT, sessions, password hashing               |
| `@zudolib/runtime`       | ✅ Complete | Application lifecycle orchestrator            |
| `@zudolib/permissions`   | ✅ Complete | RBAC, ABAC, resource authorization            |
| `@zudolib/security`      | ✅ Complete | Input validation, CORS, CSRF, rate limiting   |
| `@zudolib/tenancy`       | ✅ Complete | Multi-tenant context and isolation            |
| `@zudolib/feature-flags` | ✅ Complete | Feature flag evaluation, rule engine          |
| `@zudolib/plugins`       | ✅ Complete | Plugin registration, lifecycle, orchestration |
| `@zudolib/openapi`       | ✅ Complete | OpenAPI document generation                   |
| `@zudolib/rpc`           | ✅ Complete | RPC primitives                                |
| `@zudolib/api`           | ✅ Complete | API abstraction layer                         |

**Phase 3 Goal:** Provide the application architecture layer.

---

## Phase 4 — Transport

External interface packages.

| Package         | Status      | Notes                                      |
| --------------- | ----------- | ------------------------------------------ |
| `@zudolib/http` | ✅ Complete | HTTP request handling, routing, middleware |
| `@zudolib/cli`  | ✅ Complete | Command-line interface                     |

**Phase 4 Goal:** Provide external interfaces for Zudo applications.

---

## Phase 5 — Developer Experience

Tooling for building, testing, and documenting Zudo applications.

| Package            | Status      | Notes                         |
| ------------------ | ----------- | ----------------------------- |
| `@zudolib/testing` | ✅ Complete | Test helpers, fixtures, mocks |
| `@zudolib/docs`    | ✅ Complete | Documentation infrastructure  |

**Phase 5 Goal:** Provide excellent developer experience.

---

## Phase 6 — Integration & Examples

Real-world applications that validate the framework end-to-end.

| Example                | Status     | Notes                            |
| ---------------------- | ---------- | -------------------------------- |
| `examples/hello-world` | ⏳ Planned | Minimal HTTP server              |
| `examples/basic-api`   | ⏳ Planned | CRUD with CQRS, database, events |
| `examples/cqrs`        | ⏳ Planned | Command/query separation         |
| `examples/events`      | ⏳ Planned | Event-driven architecture        |
| `examples/modules`     | ⏳ Planned | Modular monolith                 |
| `examples/plugins`     | ⏳ Planned | Plugin system demo               |

**Phase 6 Goal:** Validate that packages work together correctly.

---

## Phase 7 — Advanced Features

Features that build on the core architecture.

| Feature              | Status     | Notes                           |
| -------------------- | ---------- | ------------------------------- |
| Hot plugin reloading | ⏳ Planned | Dev-time plugin reload          |
| Distributed tracing  | ⏳ Planned | Full OpenTelemetry integration  |
| Horizontal scaling   | ⏳ Planned | Multi-instance support          |
| Edge runtime support | ⏳ Planned | Vercel Edge, Cloudflare Workers |
| Plugin marketplace   | ⏳ Planned | Versioned, isolated plugins     |

---

## Completed Milestones

### Milestone 1 — Foundation (Completed)

- All Tier 0 and Tier 1 packages implemented.
- Dependency direction enforced.
- No circular dependencies.

### Milestone 2 — Runtime Primitives (Completed)

- All runtime infrastructure packages implemented.
- State machine patterns established.
- Lifecycle coordination working.

### Milestone 3 — Application Architecture (Completed)

- CQRS, events, messaging working.
- Plugin system implemented.
- Runtime orchestrator complete.

### Milestone 4 — Transport Layer (Completed)

- HTTP transport complete.
- CLI transport complete.

### Milestone 5 — Developer Experience (Completed)

- Testing utilities complete.
- Documentation infrastructure complete.

### Milestone 6 — Architecture Governance (Completed)

- `ARCHITECTURE.md` created.
- `DEPENDENCIES.md` created.
- `PACKAGE_RULES.md` created.
- `architect-check.js` automated validation.
- `tests/architect/boundaries.test.ts` automated tests.

---

## Next Steps

1. **Build `examples/hello-world`** — Validate the framework with a minimal HTTP server.
2. **Build `examples/basic-api`** — Validate end-to-end request flow.
3. **Identify architectural gaps** — Find missing abstractions or incorrect boundaries.
4. **Performance testing** — Benchmark request throughput and memory usage.
5. **Documentation** — Write getting started guide and API reference.

---

## How to Update This Document

When completing a package or milestone:

1. Update the package status in the appropriate phase table.
2. Add notes if relevant.
3. Mark completed milestones.
4. Update "Next Steps" based on current priorities.
