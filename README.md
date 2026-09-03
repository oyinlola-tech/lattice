# Zudo

A modular TypeScript framework for building scalable, maintainable, and production-ready applications — backend, frontend, or fullstack.

---

## What is Zudo?

Zudo is a modular TypeScript application framework designed to provide a consistent foundation for building backend services, APIs, distributed systems, frontend applications, and fullstack platforms.

Instead of forcing applications into a single architecture, Zudo provides independent packages for common infrastructure concerns such as dependency injection, configuration, HTTP, events, messaging, database access, queues, security, observability, and runtime lifecycle management.

Applications can use only the packages they need while maintaining consistent contracts across the ecosystem.

---

## Why Zudo?

Modern applications often need more than an HTTP server.

As systems grow, concerns such as configuration, dependency injection, background jobs, events, messaging, transactions, observability, security, storage, multi-tenancy, and feature flags need to work together consistently.

Zudo provides a modular foundation for these concerns without requiring every application to adopt the same runtime or deployment model.

---

## Core Philosophy

### Modular

Use only what the application needs. Every package is independent.

```
Application
     |
     +-- @zudo/core
     +-- @zudo/http
     +-- @zudo/database
     +-- @zudo/events
```

No need to install everything.

### Explicit

Dependencies and lifecycle behavior should be visible. Avoid invisible magic.

### Composable

Packages work independently but integrate naturally.

```
HTTP
 |
 v
Runtime
 |
 +-- Container
 +-- Configuration
 +-- Logger
 +-- Events
 +-- Observability
```

### Infrastructure-Neutral

The application is not tightly coupled to a specific database, queue, cloud provider, or storage backend. The `@zudo/adapters` package defines the boundary between Zudo and external platforms.

---

## Features

- Modular package architecture
- Dependency injection container
- Application lifecycle management
- Type-safe configuration
- Structured logging
- HTTP primitives and routing
- Event-driven architecture
- CQRS primitives
- Database abstractions
- Background jobs and queues
- Messaging infrastructure
- Storage adapters
- Cryptographic utilities
- Serialization
- Schema contracts
- Security primitives
- Observability and tracing
- Multi-tenancy
- Feature flags
- **Fullstack project generation**
- **11 frontend framework adapters**

---

## Architecture

```
                           Application
                                |
                                v
                            Runtime
                                |
             +------------------+------------------+
             |                  |                  |
             v                  v                  v
         Container          Lifecycle           Config
             |                  |                  |
             +------------------+------------------+
                                |
           +-------------------+-------------------+
           |                   |                   |
           v                   v                   v
          HTTP              Database             Queue
           |                   |                   |
           v                   v                   v
         Router             Storage           Messaging
```

Zudo is organized as an npm workspaces monorepo. Each package has a focused responsibility and a clear dependency boundary.

---

## Packages

### Foundation

| Package               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `@zudo/core`       | Lifecycle, context, runtime, modules                  |
| `@zudo/runtime`    | Application lifecycle orchestrator                    |
| `@zudo/container`  | DI container with token-based registration            |
| `@zudo/config`     | Layered configuration with sources                    |
| `@zudo/errors`     | Shared error base class and utilities                 |
| `@zudo/validation` | Schema validation with Zod                            |
| `@zudo/logger`     | Structured logging with transports                    |
| `@zudo/lifecycle`  | State machine, dependency ordering, graceful shutdown |
| `@zudo/constants`  | Shared constants, enums, and type-safe literals       |
| `@zudo/types`      | Shared type guards and utility types                  |
| `@zudo/middleware` | Composable middleware pipeline                        |

### Application

| Package                  | Description                                |
| ------------------------ | ------------------------------------------ |
| `@zudo/http`          | HTTP primitives, request handling, routing |
| `@zudo/schema`        | Schema definition and parsing engine       |
| `@zudo/serialization` | Data translation layer                     |
| `@zudo/cqrs`          | Command query responsibility segregation   |
| `@zudo/cli`           | Command-line interface                     |

### Data and Infrastructure

| Package                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `@zudo/database`     | Database clients, repositories, transactions |
| `@zudo/storage`      | Storage abstractions and lifecycle           |
| `@zudo/queue`        | Background job infrastructure                |
| `@zudo/messaging`    | In-process message bus                       |
| `@zudo/transactions` | Transaction lifecycle and coordination       |
| `@zudo/cache`        | Cache abstraction with adapters              |

### Security

| Package                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `@zudo/security`    | Input validation, CORS, CSRF, rate limiting |
| `@zudo/crypto`      | Cryptographic primitives                    |
| `@zudo/auth`        | JWT, sessions, password hashing             |
| `@zudo/permissions` | RBAC, ABAC, resource authorization          |

### Platform

| Package                  | Description                           |
| ------------------------ | ------------------------------------- |
| `@zudo/observability` | Metrics, tracing, context propagation |
| `@zudo/tenancy`       | Multi-tenant context and isolation    |
| `@zudo/feature-flags` | Feature flag evaluation and rollouts  |
| `@zudo/adapters`      | Boundary layer for external platforms |

### Development

| Package            | Description                   |
| ------------------ | ----------------------------- |
| `@zudo/testing` | Test helpers, fixtures, mocks |
| `@zudo/docs`    | Documentation infrastructure  |

---

## CLI — Project Generation

Zudo includes a CLI for scaffolding projects, adding features, and managing architecture.

### Installation

```bash
npm install -g zudo-cli
```

### Supported Frontend Frameworks

Zudo can generate frontend and fullstack projects with any of the following frameworks:

| Framework    | Adapter        | Build Tool  | Language |
| ------------ | -------------- | ----------- | -------- |
| React        | `react`        | Vite        | TS / JS  |
| Next.js      | `next`         | Next.js     | TS / JS  |
| Vue          | `vue`          | Vite        | TS / JS  |
| Nuxt         | `nuxt`         | Nuxt 3      | TS / JS  |
| Angular      | `angular`      | Angular CLI | TS / JS  |
| Svelte       | `svelte`       | Vite        | TS / JS  |
| SvelteKit    | `sveltekit`    | SvelteKit   | TS / JS  |
| Astro        | `astro`        | Astro       | TS / JS  |
| Vanilla HTML | `vanilla`      | Vite        | TS / JS  |
| Flutter      | `flutter`      | Flutter SDK | Dart     |
| React Native | `react-native` | Expo        | TS / JS  |

### Frontend Architectures

Each framework supports multiple project structures:

- **Zudo Standard** — Global concerns organized by domain (`components/`, `services/`, `utils/`, `types/`, etc.)
- **Feature Based** — Domain-driven feature folders with shared global utilities
- **Minimal** — Only essential folders for small projects
- **Framework Default** — Let the framework decide the structure

### How Frontend Generation Works

When you create a frontend or fullstack project, Zudo:

1. **Scaffolds the framework** using the official project template (Vite, Next.js CLI, Angular CLI, etc.)
2. **Applies Zudo structure** on top of the generated project:
   - Standardized folder layout based on the selected architecture
   - Type-safe service layer with dependency injection
   - API client configuration (REST, GraphQL, or RPC)
   - Environment variable management
   - Build and development scripts
3. **Configures the workspace** for fullstack projects:
   - Monorepo structure with `apps/backend` and `apps/web`
   - Shared TypeScript configuration
   - Proxy configuration for local API development
   - Shared type definitions between frontend and backend

### How Fullstack Generation Works

Fullstack projects combine a backend API with a frontend application in a single workspace:

```bash
zudo create my-system \
  --type fullstack \
  --architecture modular-monolith \
  --frontend next \
  --database postgresql \
  --api rest \
  --package-manager pnpm
```

This creates:

```
my-system/
├── apps/
│   ├── web/              # Frontend application
│   │   ├── src/
│   │   ├── package.json
│   │   └── ...
│   └── gateway/          # Backend API gateway (microservice)
│       ├── src/
│       ├── package.json
│       └── ...
├── packages/
│   └── shared/           # Shared types and utilities
├── package.json          # Workspace root
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

For **modular-monolith** and **monolith** architectures, the backend lives under `apps/backend/` instead of `apps/gateway/`.

### Frontend-Backend Integration

Zudo configures the generated frontend to communicate with the backend:

- **Development proxy** — API requests are proxied to the backend during development
- **Type-safe client** — Generated API client from backend schema (when using OpenAPI)
- **Shared types** — Common TypeScript types in the workspace `packages/shared/` directory
- **Environment management** — Separate `.env` files for development, staging, and production

### Creating a Project

#### Backend Only

```bash
zudo create my-api
```

Options:

```bash
zudo create my-api \
  --architecture monolith \
  --package-manager pnpm \
  --database postgresql \
  --api rest
```

#### Frontend Only

```bash
zudo create my-web \
  --type frontend \
  --frontend react \
  --frontend-architecture zudo-standard
```

#### Full Stack

```bash
zudo create my-system \
  --type fullstack \
  --architecture modular-monolith \
  --frontend next \
  --database postgresql \
  --api rest \
  --package-manager pnpm
```

### Adding Features

After project creation, add capabilities:

```bash
zudo add queue
zudo add database
zudo add cache
zudo add storage
```

### Development Server

```bash
zudo dev
```

Starts all applications in the workspace with a single command.

- **Backend only** — Starts the API server with hot reload
- **Frontend only** — Starts the frontend dev server
- **Fullstack** — Starts both backend and frontend concurrently

Options:

```bash
zudo dev --frontend-only   # Start only the frontend
zudo dev --backend-only    # Start only the backend
zudo dev --port 3000       # Custom port for backend
```

---

## Quick Start

### Backend

```ts
import { createApplication } from "@zudo/runtime";
import { createHTTPServer } from "@zudo/http";

const app = await createApplication();

const server = createHTTPServer({ app });

server.get("/", () => {
  return { message: "Hello from Zudo" };
});

await app.start();
```

### Fullstack

```bash
# Create a fullstack project
zudo create my-fullstack-app \
  --type fullstack \
  --frontend react \
  --architecture monolith

# Navigate and start
cd my-fullstack-app
pnpm dev
```

---

## Project Status

Zudo is currently under active development.

The public API may change before the first stable release. Use packages with caution in production.

| Status       | Description                     |
| ------------ | ------------------------------- |
| Built        | Package implementation complete |
| Beta         | API may change                  |
| Experimental | Not recommended for production  |

All published packages are at version `0.1.x` and marked as **Built**.

---

## Installation

Zudo packages can be installed individually.

```bash
pnpm add @zudo/core
```

Install additional packages depending on the application requirements.

```bash
pnpm add @zudo/http @zudo/config @zudo/logger
```

---

## Development

### Prerequisites

- Node.js >= 24
- pnpm >= 11

### Setup

```bash
git clone https://github.com/oyinlola-tech/zudo.git
cd zudo
pnpm install
pnpm run build
```

### Useful Commands

```bash
pnpm run build          # Build all packages
pnpm run typecheck      # Typecheck all packages
pnpm run format         # Format code with Prettier
pnpm run test           # Run architect tests
```

### Per-Package Commands

```bash
pnpm run --filter=@zudo/http typecheck
pnpm run --filter=@zudo/http build
```

---

## Contributing

Contributions are welcome.

Before submitting a contribution, please read the contribution guidelines.

See [CONTRIBUTING.md](./CONTRIBUTING.md).

---

## Security

If you discover a security vulnerability, please do not open a public issue.

See [SECURITY.md](./SECURITY.md) for instructions on responsible vulnerability disclosure.

---

## License

Zudo is licensed under the MIT License.

See [LICENSE](./LICENSE) for details.
