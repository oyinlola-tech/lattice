# Project Documentation
> Generated: 2026-08-26T14:15:00Z | Mode: FULL

## Tech Stack
- Runtime: Node.js (implied by async_hooks usage)
- Language: TypeScript
- Framework: Custom modular application framework ("Lattice")
- Package Manager: pnpm (workspace monorepo)
- Testing: Vitest (config file present)
- Code Quality: Prettier, EditorConfig, Husky (pre-commit hooks)
- Versioning: Changesets
- CI/CD: GitHub Actions (ci.yml, codeql.yml, release.yml — all empty stubs)

## Dependencies
No runtime dependencies are declared yet — `package.json`, `pnpm-workspace.yaml`, `pnpm-lock.yaml` are all empty files. This is a framework under active development with no published packages.

## Architecture Pattern
**Modular Monolith / Plugin Architecture**

Lattice is a modular application framework for Node.js/TypeScript. It provides core abstractions for:
- Application lifecycle management
- Dependency injection container
- Configuration management with layered sources and validation
- Execution context propagation via AsyncLocalStorage
- Structured logging
- Module registration and loading
- Adapter-based integration with external systems

The architecture follows Clean Architecture principles with strong interface contracts and adapter patterns.

## Folder Structure
```
Lattice/
├── packages/                    # Monorepo packages (pnpm workspaces)
│   ├── core/                    # ✅ Core framework (57 source files, ~9045 LOC)
│   │   ├── src/
│   │   │   ├── application/     # Application bootstrap, state machine, context
│   │   │   ├── configuration/   # Layered config: sources, loading, validation, redaction
│   │   │   ├── container/       # DI container: tokens, providers, scopes
│   │   │   ├── context/         # Execution context: AsyncLocalStorage, snapshots, keys
│   │   │   ├── contracts/       # Core interfaces: Adapter, Handler, Disposable
│   │   │   ├── errors/          # FrameworkError hierarchy, error codes
│   │   │   ├── lifecycle/       # Lifecycle state machine, hooks, registry, scopes
│   │   │   ├── logging/         # Logger interface, ConsoleLogger, factory, levels
│   │   │   ├── modules/         # Module system (stubs — files exist but are empty)
│   │   │   └── runtime/         # Runtime abstraction (stubs — files exist but are empty)
│   │   └── tests/               # Unit tests (all empty stubs)
│   ├── auth/                    # 🔲 Empty placeholder
│   ├── cache/                   # 🔲 Empty placeholder
│   ├── cli/                     # 🔲 Empty placeholder
│   ├── config/                  # 🔲 Empty placeholder
│   ├── cqrs/                    # 🔲 Empty placeholder
│   ├── database/                # 🔲 Empty placeholder
│   ├── events/                  # 🔲 Empty placeholder
│   ├── http/                    # 🔲 Empty placeholder
│   ├── messaging/               # 🔲 Empty placeholder
│   ├── observability/           # 🔲 Empty placeholder
│   ├── queue/                   # 🔲 Empty placeholder
│   ├── runtime/                 # 🔲 Empty placeholder
│   ├── security/                # 🔲 Empty placeholder
│   ├── storage/                 # 🔲 Empty placeholder
│   ├── testing/                 # 🔲 Empty placeholder
│   └── validation/              # 🔲 Empty placeholder
├── docs/                        # Documentation (all empty stubs)
│   ├── architecture/
│   ├── concepts/
│   ├── contributing/
│   └── getting-started/
├── examples/                    # Example applications (all empty stubs)
│   ├── basic-api/
│   ├── microservices/
│   ├── modular-monolith/
│   ├── monolith/
│   └── worker/
├── tests/
│   ├── e2e/                     # Empty
│   └── integration/             # application-bootstrap.test.ts (empty)
├── scripts/                     # build.ts, release.ts, verify.ts (all empty)
├── .github/
│   ├── workflows/               # ci.yml, codeql.yml, release.yml (all empty)
│   ├── ISSUE_TEMPLATE/          # bug-report.yml, feature-request.yml (empty)
│   └── pull_request_template.md # Empty
├── .changeset/config.json       # Empty
├── .husky/pre-commit            # Empty
├── vitest.config.ts             # Empty
├── tsconfig.json                # Empty
├── tsconfig.base.json           # Empty
├── pnpm-workspace.yaml          # Empty
├── pnpm-lock.yaml               # Empty
└── .gitignore                   # .env, node_modules/, dist/, coverage, .DS_Store
```

## Code Style Conventions
- **Naming**: PascalCase for classes/interfaces/types, camelCase for functions/variables
- **File naming**: kebab-case for all source files (e.g. `application-state.ts`, `context-key.ts`)
- **Exports**: Named exports exclusively; barrel `index.ts` files re-export public API
- **Imports**: Type-only imports used consistently (`import type { ... }`)
- **Error handling**: Custom error classes extending `FrameworkError` with machine-readable error codes
- **Immutability**: `readonly` used extensively on interfaces and properties; `Object.freeze()` for immutable data
- **Formatting**: Allman-style braces (opening brace on new line), explicit `return` statements, trailing commas
- **Documentation**: JSDoc on all public APIs; no inline comments in implementation
- **Null safety**: Optional chaining and nullish coalescing used throughout

## Modularity Practices
- **Interface-first design**: Every major abstraction is defined as an interface before implementation
- **Adapter pattern**: External integrations defined via `Adapter<TOptions>` interface with `initialize/start/stop/dispose` lifecycle
- **Token-based DI**: Dependencies registered via string, symbol, or class tokens with singleton/scoped/transient lifetimes
- **Layered configuration**: Sources loaded by priority (default → environment → file → secret → runtime)
- **Execution context isolation**: AsyncLocalStorage-based context propagation with typed keys and snapshot/restore
- **Lifecycle hooks**: Components can implement granular hooks (`OnInitialize`, `OnStart`, `OnStop`, `OnDestroy`) or full `LifecycleParticipant`
- **Scope-based lifecycle**: Independent lifecycle boundaries for modules, plugins, workers via `LifecycleScope`

## Data Architecture
- No database or ORM integration yet
- Configuration is stored as immutable nested objects with dot-path access
- Execution context uses `Map<symbol, unknown>` for typed key-value storage
- DI container uses `Map<Token, ProviderRegistration>` with singleton instance caching

## Cross-Cutting Concerns
- **Error handling**: `FrameworkError` hierarchy with codes (`ErrorCode` const object), `toJSON()` serialization, HTTP status mapping
- **Logging**: `Logger` interface with trace/debug/info/warn/error/fatal levels; `ConsoleLogger` implementation with structured JSON and human-readable modes; `LoggerFactory` for instantiation
- **Configuration redaction**: `ConfigurationRedactor` with pattern-based sensitive path detection (passwords, secrets, tokens, API keys)
- **Configuration validation**: Schema-based validation with `ConfigurationSchema<T>` and `ConfigurationSchemaRegistry`
- **Context propagation**: `ContextProvider` → `ContextStorage` (AsyncLocalStorage) → `ExecutionContext` with typed `ContextKey<T>` and `ContextValues`

## Service Communication
- **Adapter interface** defined but no concrete adapters implemented yet
- Supported adapter types (documented): HTTP (Fastify), Database (Prisma, PostgreSQL), Cache (Redis), Messaging (Kafka, NATS), Storage (S3)
- **Handler pattern**: Generic `Handler<TInput, TOutput>` interface for request/response operations across transports

## Test Coverage
- Overall coverage: **0%** (all test files are empty stubs)
- Testing framework: Vitest
- Key untested areas: All source code (57 files, ~9045 LOC)
- Test files exist: `application.test.ts`, `container.test.ts`, `lifecycle.test.ts`, `modules.test.ts`, `runtime.test.ts`, `application-bootstrap.test.ts` — all empty

## Entry Points
- `packages/core/src/index.ts` — Core package barrel export (empty)
- `packages/core/src/application/application.ts` — `Application.create()` factory method
- `vitest.config.ts` — Test configuration (empty)
- `tsconfig.json` / `tsconfig.base.json` — TypeScript configuration (empty)
- `pnpm-workspace.yaml` — Workspace definition (empty)

## Changed Files
N/A — Full scan

## Last Scanned
2026-08-26T14:15:00Z
