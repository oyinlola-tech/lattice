# Zudolib Architecture

> This document describes the conceptual architecture of the Zudolib framework.
> It explains how the major components fit together, the design principles that guide the system,
> and the lifecycle of a Zudolib application from startup to shutdown.

---

## 1. Overview

Zudolib is a modular TypeScript application framework designed for building scalable, maintainable backend systems.

It provides:

- A **dependency injection container** for managing service lifetimes and dependencies.
- A **module system** for organizing applications into cohesive, reusable units.
- A **lifecycle orchestrator** that coordinates startup, shutdown, and health checks.
- **Application architecture patterns** including CQRS, event-driven messaging, and transactional boundaries.
- **Transport abstractions** for HTTP, RPC, and CLI interfaces.
- **Infrastructure integrations** for databases, queues, caches, and schedulers.
- **Cross-cutting concerns** including observability, security, permissions, multi-tenancy, and feature flags.
- A **plugin system** for controlled extensibility.

Zudolib is built on three core beliefs:

1. **Explicit over implicit** — dependencies, boundaries, and lifecycles should be visible and enforceable.
2. **Composition over inheritance** — behavior is assembled through composition, not class hierarchies.
3. **Type safety end-to-end** — from request input to database output, types should flow through the entire stack.

---

## 2. Design Principles

### 2.1 Dependency Direction

Dependencies flow inward.

Foundation packages have no `@zudolib/*` dependencies.
Higher-level packages may depend on lower-level packages.
No package may depend on a package in a higher tier.

```
Foundation → Runtime Primitives → Application Architecture → Infrastructure Abstractions → Transport → Developer Experience
```

This prevents circular dependencies and ensures that changes to higher-level packages never break foundation code.

### 2.2 Interface-First Design

Interfaces are defined before implementations.
Consumers depend on abstractions, not concrete classes.

This allows:

- Swapping implementations without changing consumers.
- Testing with fakes and mocks.
- Clear contracts between modules.

### 2.3 Single Responsibility

Each package has exactly one reason to change.
Packages should be small, focused, and independently testable.

If a package starts doing too many things, it should be split.

### 2.4 Explicit Lifecycle

Every major component has a well-defined lifecycle:

```
register
  → install
    → initialize
      → start
        → running
          → stop
            → dispose
```

Lifecycles are coordinated by the runtime, not left to chance.

### 2.5 Controlled Context

Plugins, modules, and middleware receive a controlled context.
They do not receive the entire application object.

This enforces architectural boundaries and prevents hidden coupling.

### 2.6 Errors as Values

Errors are first-class citizens.
Every package defines its own error hierarchy rooted in `@zudolib/errors`.

Errors carry:

- A machine-readable code.
- A human-readable message.
- Operational metadata (plugin name, dependency name, etc.).
- A severity level.

### 2.7 Observability by Default

Every lifecycle transition, request, and error is observable.
Logging, metrics, and tracing are built into the framework, not bolted on.

### 2.8 Security in the Foundation

Input validation, CORS, CSRF protection, rate limiting, and security headers are provided by `@zudolib/security`.
Application code should never reimplement these primitives.

---

## 3. Architectural Layers

Zudolib is organized into five conceptual layers.

### 3.1 Foundation Layer

The base of the framework.

Provides:

- Error handling (`@zudolib/errors`)
- Type utilities (`@zudolib/types`)
- Constants and branded types (`@zudolib/constants`)
- Dependency injection (`@zudolib/container`)
- Configuration (`@zudolib/config`)
- Logging (`@zudolib/logger`)
- Validation (`@zudolib/validation`)
- Serialization (`@zudolib/serialization`)

These packages have no `@zudolib/*` dependencies (except `@zudolib/errors`).

### 3.2 Runtime Primitives Layer

Provides the runtime building blocks.

- **Lifecycle** (`@zudolib/lifecycle`) — state machines, dependency ordering, graceful shutdown.
- **Events** (`@zudolib/events`) — event bus, emitter, middleware, registry.
- **Messaging** (`@zudolib/messaging`) — in-process message bus with handlers and middleware.
- **Transactions** (`@zudolib/transactions`) — transaction lifecycle, context propagation, savepoints.
- **Schema** (`@zudolib/schema`) — type-safe data contracts with validation.
- **Crypto** (`@zudolib/crypto`) — hashing, encryption, tokens.
- **Cache** (`@zudolib/cache`) — cache abstraction with adapters, tags, locking.
- **Storage** (`@zudolib/storage`) — database and object storage abstractions.
- **Queue** (`@zudolib/queue`) — background job infrastructure.
- **Scheduler** (`@zudolib/scheduler`) — job scheduling, cron, triggers.

### 3.3 Application Architecture Layer

Provides patterns for structuring applications.

- **Core** (`@zudolib/core`) — application context, modules, lifecycle integration.
- **CQRS** (`@zudolib/cqrs`) — command/query separation, handlers, bus integration.
- **Auth** (`@zudolib/auth`) — JWT, sessions, password hashing.
- **Permissions** (`@zudolib/permissions`) — RBAC, ABAC, resource authorization.
- **Runtime** (`@zudolib/runtime`) — application lifecycle orchestrator.
- **Plugins** (`@zudolib/plugins`) — plugin registration, lifecycle, orchestration.
- **Feature Flags** (`@zudolib/feature-flags`) — feature flag evaluation, rule engine.
- **Tenancy** (`@zudolib/tenancy`) — multi-tenant context and isolation.
- **Security** (`@zudolib/security`) — input validation, CORS, CSRF, rate limiting.
- **Adapters** (`@zudolib/adapters`) — boundary layer between Zudolib and external platforms.

### 3.4 Transport Layer

Translates external requests into internal application calls.

- **HTTP** (`@zudolib/http`) — request handling, routing, middleware.
- **RPC** (`@zudolib/rpc`) — RPC primitives.
- **API** (`@zudolib/api`) — API abstraction layer.
- **OpenAPI** (`@zudolib/openapi`) — OpenAPI document generation.
- **CLI** (`@zudolib/cli`) — command-line interface.

### 3.5 Developer Experience Layer

Tools for building, testing, and documenting Zudolib applications.

- **Testing** (`@zudolib/testing`) — test helpers, fixtures, mocks.
- **Docs** (`@zudolib/docs`) — documentation infrastructure.
- **Observability** (`@zudolib/observability`) — structured logging, metrics, tracing, exporters.

---

## 4. Application Lifecycle

A Zudolib application follows a strict lifecycle managed by `@zudolib/runtime`.

### 4.1 Startup

```
1. Bootstrap
   - Load configuration from layered sources.
   - Initialize the DI container.
   - Create the event bus.
   - Initialize the logger.

2. Module Registration
   - Register modules with the container.
   - Validate module dependencies.
   - Resolve module import order.

3. Plugin Registration
   - Register plugins.
   - Validate plugin dependencies.
   - Resolve plugin start order.

4. Initialization
   - Initialize all modules in dependency order.
   - Connect to infrastructure (database, cache, queue).
   - Load feature flags.
   - Establish tenant resolvers.

5. Start
   - Start all modules in dependency order.
   - Begin accepting requests.
   - Start background workers.
   - Emit `application:started` event.

6. Ready
   - Application is now accepting traffic.
```

### 4.2 Running

During the running phase:

- Requests flow through the transport layer into the application layer.
- CQRS commands and queries are dispatched.
- Events are published and consumed.
- Transactions are coordinated.
- Background jobs are processed.
- Metrics and logs are emitted.

### 4.3 Shutdown

```
1. Stop Accepting Requests
   - Mark the application as draining.
   - Finish in-flight requests up to a deadline.

2. Stop Modules
   - Stop modules in reverse dependency order.
   - Flush pending events.
   - Stop background workers.

3. Dispose
   - Close database connections.
   - Dispose plugins in reverse order.
   - Release resources.

4. Shutdown Complete
   - Emit `application:stopped` event.
   - Exit process (or await restart).
```

---

## 5. Request Lifecycle

A typical request flows through Zudolib as follows:

```
Incoming Request
       │
       ▼
Transport Layer (HTTP / RPC / CLI)
       │
       ▼
Middleware Pipeline
   - Security headers
   - CORS
   - Rate limiting
   - Authentication
   - Tenancy resolution
   - Logging / tracing
       │
       ▼
Router
       │
       ▼
Controller / Handler
       │
       ▼
CQRS Bus
   │
   ├── Command → CommandHandler → Repository → Database
   │
   └── Query → QueryHandler → Read Model → Cache / Database
       │
       ▼
Response
   - Serialization
   - Error handling
   - Observability
       │
       ▼
Outgoing Response
```

Key principles:

- **Separation of concerns**: each layer has a single responsibility.
- **Explicit flow**: the request path is predictable and debuggable.
- **Type safety**: request/response types flow through the entire stack.
- **Observability**: every stage is instrumented.

---

## 6. Module System

Zudolib applications are composed of modules.

### 6.1 Module Definition

A module is a self-contained unit of functionality.

```ts
@Module({
  imports: [DatabaseModule, EventsModule],
  providers: [UserRepository, UserService],
  controllers: [UserController],
})
export class UsersModule {}
```

### 6.2 Module Boundaries

Modules define explicit boundaries:

- **Imports**: other modules this module depends on.
- **Exports**: services this module exposes to other modules.
- **Providers**: services scoped to this module.
- **Controllers**: request handlers scoped to this module.

### 6.3 Module Lifecycle

Modules participate in the application lifecycle:

```
Module Registration
    ↓
Module Initialization
    ↓
Module Start
    ↓
Module Running
    ↓
Module Stop
    ↓
Module Dispose
```

### 6.4 Module Composition

Modules compose into applications:

```
Application
├── UsersModule
│   ├── imports: DatabaseModule, EventsModule
│   └── exports: UserService
├── OrdersModule
│   ├── imports: UsersModule, PaymentsModule
│   └── exports: OrderService
└── PaymentsModule
    ├── imports: DatabaseModule
    └── exports: PaymentService
```

---

## 7. Dependency Injection

Zudolib uses a token-based DI container (`@zudolib/container`).

### 7.1 Registration

Services are registered with tokens:

```ts
container.register(UserRepositoryToken, () => new UserRepository());
container.register(
  UserServiceToken,
  (ctx) => new UserService(ctx.resolve(UserRepositoryToken)),
);
```

### 7.2 Resolution

Dependencies are resolved at runtime:

```ts
const userService = container.resolve(UserServiceToken);
```

### 7.3 Scopes

The container supports scoped lifecycles:

- **Singleton** — one instance for the application lifetime.
- **Scoped** — one instance per request/operation.
- **Transient** — a new instance for every resolution.

### 7.4 Circular Dependency Prevention

The container detects circular dependencies at resolution time and throws a clear error.

---

## 8. Runtime Model

The runtime (`@zudolib/runtime`) orchestrates the entire application.

### 8.1 Responsibilities

- Bootstrap the application from configuration.
- Coordinate module and plugin lifecycles.
- Manage the dependency container.
- Handle signals (SIGINT, SIGTERM) for graceful shutdown.
- Expose health checks and diagnostics.

### 8.2 Runtime States

```
Created → Initializing → Ready → Running → Draining → Stopped
```

### 8.3 Runtime Events

The runtime emits events for observability:

- `runtime:creating`
- `runtime:initializing`
- `runtime:ready`
- `runtime:running`
- `runtime:draining`
- `runtime:stopped`
- `runtime:error`

---

## 9. Transport Layer

The transport layer is the boundary between the outside world and the Zudolib application.

### 9.1 Principle

Transport packages translate external requests into internal application calls.

They should:

- Parse incoming requests.
- Apply transport-specific middleware.
- Route to the appropriate handler.
- Serialize responses.

They should NOT:

- Contain business logic.
- Directly access the database.
- Know about other transport packages.

### 9.2 HTTP Transport

- Request parsing and validation.
- Routing with path parameters.
- Middleware pipeline.
- Response serialization.
- Error mapping to HTTP status codes.

### 9.3 RPC Transport

- Request/response envelope.
- Method dispatch.
- Error mapping to RPC error codes.

### 9.4 CLI Transport

- Command parsing.
- Argument validation.
- Output formatting.

---

## 10. Infrastructure Layer

Infrastructure packages provide integrations with external systems.

### 10.1 Database

- Connection management.
- Transaction coordination.
- Repository pattern support.
- Query building.

### 10.2 Cache

- Key-value storage.
- Tag-based invalidation.
- Distributed locking.
- Metrics.

### 10.3 Queue

- Background job definitions.
- Worker lifecycle.
- Retry and backoff.
- Dead-letter queues.

### 10.4 Scheduler

- Cron-based scheduling.
- Trigger management.
- Job store.
- Distributed locking.

### 10.5 Storage

- Object storage abstraction.
- Multipart upload.
- Presigned URLs.

---

## 11. Extensibility

Zudolib provides multiple extension points.

### 11.1 Modules

The primary extension mechanism.
Modules encapsulate features and compose into applications.

### 11.2 Plugins

A controlled extension system (`@zudolib/plugins`).

Plugins:

- Register with the plugin manager.
- Declare dependencies on other plugins.
- Receive a controlled context (container, config, logger, events).
- Participate in the lifecycle (install, initialize, start, stop, dispose).

### 11.3 Middleware

Transport-agnostic middleware pipelines.

### 11.4 Events

Event-driven extensibility through the event bus.

### 11.5 Hooks

Lifecycle hooks allow code to run at specific points:

- `onModuleInit`
- `onModuleDestroy`
- `onApplicationStart`
- `onApplicationStop`

---

## 12. Error Handling

### 12.1 Error Hierarchy

All errors extend `BaseError` from `@zudolib/errors`.

```
BaseError
├── ApplicationError
├── DomainError
├── ValidationError
├── ConfigurationError
├── AuthenticationError
├── AuthorizationError
├── NetworkError
├── DatabaseError
├── StorageError
├── TimeoutError
└── ... (domain-specific errors)
```

### 12.2 Error Properties

Every error carries:

- `code` — machine-readable error code.
- `message` — human-readable description.
- `cause` — underlying error.
- `statusCode` — HTTP status code (for transport errors).
- `expose` — whether the error is safe to expose to clients.
- `metadata` — additional structured data.

### 12.3 Error Propagation

Errors propagate up through the call stack.
At the transport boundary, errors are mapped to appropriate responses.
Internal errors are never exposed to clients.

### 12.4 Domain Errors

Each package defines domain-specific errors.

```ts
// @zudolib/database
DatabaseConnectionError;
QueryExecutionError;
TransactionError;

// @zudolib/auth
AuthenticationError;
InvalidTokenError;
SessionExpiredError;
```

---

## 13. Observability

### 13.1 Logging

- Structured JSON logs.
- Context propagation (request ID, user ID, tenant ID).
- Transports: console, file, external.
- Log levels: debug, info, warn, error.

### 13.2 Metrics

- Counter, gauge, histogram metrics.
- Built-in metrics for framework internals.
- Custom metrics for application code.

### 13.3 Tracing

- OpenTelemetry-compatible distributed tracing.
- Automatic span creation for requests.
- Manual spans for custom operations.

### 13.4 Health Checks

- Liveness probe.
- Readiness probe.
- Plugin health status.

### 13.5 Diagnostics

The plugin manager and runtime expose diagnostic information:

```ts
app.plugins.diagnostics();
app.runtime.diagnostics();
```

---

## 14. Security Model

### 14.1 Input Validation

All external input is validated at the boundary using `@zudolib/security`.

### 14.2 Authentication

- JWT tokens.
- Session cookies.
- API keys.

### 14.3 Authorization

- Role-based access control (RBAC).
- Attribute-based access control (ABAC).
- Resource-level policies.

### 14.4 Transport Security

- CORS configuration.
- CSRF protection.
- Security headers (CSP, HSTS, etc.).
- Rate limiting.

### 14.5 Secrets Management

- Secrets loaded from environment variables.
- Auto-redaction in logs and diagnostics.
- No hardcoded credentials.

---

## 15. Performance Principles

### 15.1 Minimize Allocations

- Prefer object pools for high-frequency allocations.
- Avoid unnecessary object creation in hot paths.

### 15.2 Avoid Reflection

- Minimal use of decorators and metadata reflection.
- Prefer compile-time code generation.

### 15.3 Lazy Initialization

- Defer expensive operations until needed.
- Use async initialization for background resources.

### 15.4 Concurrency

- Use worker pools for CPU-bound work.
- Use async I/O for I/O-bound work.
- Limit concurrency to prevent resource exhaustion.

### 15.5 Caching

- Cache frequently accessed data.
- Invalidate caches explicitly.
- Use tag-based invalidation.

---

## 16. Package Structure

Every Zudolib package follows a consistent structure.

```
packages/<package-name>/
├── src/
│   ├── index.ts                    # Barrel exports (public API only)
│   ├── <domain>/
│   │   ├── index.ts                # Barrel for subfolder
│   │   ├── <domain>.<concern>.ts   # Implementation files
│   │   └── ...
│   ├── <domain>Errors/
│   │   ├── index.ts
│   │   └── <domain>Error.core.ts
│   └── ...
├── tests/
│   └── <package-name>.test.ts
├── package.json
├── tsconfig.json
└── README.md
```

Rules:

- Maximum 5 files per folder (excluding `index.ts`).
- Maximum 150 lines per file.
- Barrel `index.ts` files re-export the public API only.
- No business logic in barrel files.
- Dot notation for file names: `pluginState.type.ts`, `pluginLifecycle.core.ts`.

---

## 17. Architectural Decisions

### 17.1 Why ESM?

Zudolib uses ECMAScript modules (ESM) for:

- Native browser compatibility.
- Better tree-shaking.
- Clearer module boundaries.
- Future-proofing.

### 17.2 Why TypeScript?

TypeScript provides:

- Compile-time type safety.
- Better IDE support.
- Self-documenting code.
- Early error detection.

### 17.3 Why npm Workspaces?

npm workspaces provide:

- Native monorepo support.
- Simple dependency management.
- No external tooling required.

### 17.4 Why Vitest?

Vitest provides:

- Fast test execution.
- Native ESM support.
- Simple configuration.
- Compatible with Jest API.

### 17.5 Why Not NestJS?

Zudolib differs from NestJS in:

- No decorator-heavy configuration.
- Explicit dependency direction.
- Lighter runtime overhead.
- Stronger architectural boundaries.
- Plugin system over modules as the primary extension mechanism.

---

## 18. Cross-Cutting Concerns

### 18.1 AsyncLocalStorage

Zudolib uses `AsyncLocalStorage` for context propagation:

- Execution context.
- Tenant context.
- Transaction context.
- Logger context.

Context flows automatically through async call chains.
Application code never passes context manually.

### 18.2 AbortController

Long-running operations accept `AbortSignal` for cancellation:

- Plugin lifecycle operations.
- Database queries.
- HTTP requests.
- Background jobs.

This enables graceful shutdown and timeout handling.

### 18.3 State Machines

Complex state transitions use state machines:

- Plugin lifecycle.
- Application lifecycle.
- Transaction lifecycle.
- Container lifecycle.

State machines prevent invalid transitions and make debugging easier.

---

## 19. Future Directions

### 19.1 Edge Runtime Support

Zudolib aims to support edge runtimes (Vercel Edge, Cloudflare Workers) through adapter abstractions.

### 19.2 Plugin Marketplace

The plugin system could evolve into a marketplace with:

- Version compatibility checks.
- Capability declarations.
- Permission enforcement.
- Isolated execution (worker threads or separate processes).

### 19.3 Distributed Tracing

Full OpenTelemetry integration for distributed tracing across:

- HTTP requests.
- CQRS commands.
- Events.
- Database queries.
- External API calls.

### 19.4 Horizontal Scaling

Support for multi-instance deployments:

- Distributed cache.
- Distributed lock.
- Message queue.
- Shared session store.

---

## 20. Glossary

| Term                 | Definition                                                                 |
| -------------------- | -------------------------------------------------------------------------- |
| Module               | A self-contained unit of functionality with explicit imports and exports.  |
| Plugin               | A controlled extension that participates in the application lifecycle.     |
| Transport            | The boundary layer that translates external requests into internal calls.  |
| Infrastructure       | External system integrations (database, cache, queue, scheduler).          |
| Context              | Controlled environment provided to plugins, middleware, and handlers.      |
| State Machine        | A formal model of valid state transitions for lifecycle management.        |
| Lifecycle            | The sequence of states a component goes through from creation to disposal. |
| Tier                 | A dependency level in the package hierarchy (0 = leaf, 4 = DX).            |
| Dependency Direction | The rule that dependencies flow from higher-level to lower-level packages. |
