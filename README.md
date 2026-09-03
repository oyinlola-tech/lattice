# Zudolib

A modular TypeScript framework for building scalable, maintainable, and production-ready applications — backend, frontend, or fullstack.

---

## What is Zudolib?

Zudolib is a modular TypeScript application framework designed to provide a consistent foundation for building backend services, APIs, distributed systems, frontend applications, and fullstack platforms.

Instead of forcing applications into a single architecture, Zudolib provides independent packages for common infrastructure concerns such as dependency injection, configuration, HTTP, events, messaging, database access, queues, security, observability, and runtime lifecycle management.

Applications can use only the packages they need while maintaining consistent contracts across the ecosystem.

---

## Why Zudolib?

Modern applications often need more than an HTTP server.

As systems grow, concerns such as configuration, dependency injection, background jobs, events, messaging, transactions, observability, security, storage, multi-tenancy, and feature flags need to work together consistently.

Zudolib provides a modular foundation for these concerns without requiring every application to adopt the same runtime or deployment model.

---

## Core Philosophy

### Modular

Use only what the application needs. Every package is independent.

```
Application
     |
     +-- @zudoliblib/core
     +-- @zudoliblib/http
     +-- @zudoliblib/database
     +-- @zudoliblib/events
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

The application is not tightly coupled to a specific database, queue, cloud provider, or storage backend. The `@zudoliblib/adapters` package defines the boundary between Zudolib and external platforms.

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

Zudolib is organized as an npm workspaces monorepo. Each package has a focused responsibility and a clear dependency boundary.

---

## Packages

### Foundation

| Package               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `@zudoliblib/core`       | Lifecycle, context, runtime, modules                  |
| `@zudoliblib/runtime`    | Application lifecycle orchestrator                    |
| `@zudoliblib/container`  | DI container with token-based registration            |
| `@zudoliblib/config`     | Layered configuration with sources                    |
| `@zudoliblib/errors`     | Shared error base class and utilities                 |
| `@zudoliblib/validation` | Schema validation with Zod                            |
| `@zudoliblib/logger`     | Structured logging with transports                    |
| `@zudoliblib/lifecycle`  | State machine, dependency ordering, graceful shutdown |
| `@zudoliblib/constants`  | Shared constants, enums, and type-safe literals       |
| `@zudoliblib/types`      | Shared type guards and utility types                  |
| `@zudoliblib/middleware` | Composable middleware pipeline                        |

### Application

| Package                  | Description                                |
| ------------------------ | ------------------------------------------ |
| `@zudoliblib/http`          | HTTP primitives, request handling, routing |
| `@zudoliblib/schema`        | Schema definition and parsing engine       |
| `@zudoliblib/serialization` | Data translation layer                     |
| `@zudoliblib/cqrs`          | Command query responsibility segregation   |
| `@zudoliblib/cli`           | Command-line interface                     |

### Data and Infrastructure

| Package                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `@zudoliblib/database`     | Database clients, repositories, transactions |
| `@zudoliblib/storage`      | Storage abstractions and lifecycle           |
| `@zudoliblib/queue`        | Background job infrastructure                |
| `@zudoliblib/messaging`    | In-process message bus                       |
| `@zudoliblib/transactions` | Transaction lifecycle and coordination       |
| `@zudoliblib/cache`        | Cache abstraction with adapters              |

### Security

| Package                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `@zudoliblib/security`    | Input validation, CORS, CSRF, rate limiting |
| `@zudoliblib/crypto`      | Cryptographic primitives                    |
| `@zudoliblib/auth`        | JWT, sessions, password hashing             |
| `@zudoliblib/permissions` | RBAC, ABAC, resource authorization          |

### Platform

| Package                  | Description                           |
| ------------------------ | ------------------------------------- |
| `@zudoliblib/observability` | Metrics, tracing, context propagation |
| `@zudoliblib/tenancy`       | Multi-tenant context and isolation    |
| `@zudoliblib/feature-flags` | Feature flag evaluation and rollouts  |
| `@zudoliblib/adapters`      | Boundary layer for external platforms |

### Development

| Package            | Description                   |
| ------------------ | ----------------------------- |
| `@zudoliblib/testing` | Test helpers, fixtures, mocks |
| `@zudoliblib/docs`    | Documentation infrastructure  |

---

## CLI — Project Generation

Zudolib includes a CLI for scaffolding projects, adding features, and managing architecture.

### Installation

```bash
npm install -g zudolib-cli
```

### Supported Frontend Frameworks

Zudolib can generate frontend and fullstack projects with any of the following frameworks:

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

- **Zudolib Standard** — Global concerns organized by domain (`components/`, `services/`, `utils/`, `types/`, etc.)
- **Feature Based** — Domain-driven feature folders with shared global utilities
- **Minimal** — Only essential folders for small projects
- **Framework Default** — Let the framework decide the structure

### How Frontend Generation Works

When you create a frontend or fullstack project, Zudolib:

1. **Scaffolds the framework** using the official project template (Vite, Next.js CLI, Angular CLI, etc.)
2. **Applies Zudolib structure** on top of the generated project:
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
zudolib create my-system \
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

Zudolib configures the generated frontend to communicate with the backend:

- **Development proxy** — API requests are proxied to the backend during development
- **Type-safe client** — Generated API client from backend schema (when using OpenAPI)
- **Shared types** — Common TypeScript types in the workspace `packages/shared/` directory
- **Environment management** — Separate `.env` files for development, staging, and production

### Creating a Project

#### Backend Only

```bash
zudolib create my-api
```

Options:

```bash
zudolib create my-api \
  --architecture monolith \
  --package-manager pnpm \
  --database postgresql \
  --api rest
```

#### Frontend Only

```bash
zudolib create my-web \
  --type frontend \
  --frontend react \
  --frontend-architecture zudolib-standard
```

#### Full Stack

```bash
zudolib create my-system \
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
zudolib add queue
zudolib add database
zudolib add cache
zudolib add storage
```

### Development Server

```bash
zudolib dev
```

Starts all applications in the workspace with a single command.

- **Backend only** — Starts the API server with hot reload
- **Frontend only** — Starts the frontend dev server
- **Fullstack** — Starts both backend and frontend concurrently

Options:

```bash
zudolib dev --frontend-only   # Start only the frontend
zudolib dev --backend-only    # Start only the backend
zudolib dev --port 3000       # Custom port for backend
```

---

## Quick Start

### Backend

```ts
import { createApplication } from "@zudoliblib/runtime";
import { createHTTPServer } from "@zudoliblib/http";

const app = await createApplication();

const server = createHTTPServer({ app });

server.get("/", () => {
  return { message: "Hello from Zudolib" };
});

await app.start();
```

### Fullstack

```bash
# Create a fullstack project
zudolib create my-fullstack-app \
  --type fullstack \
  --frontend react \
  --architecture monolith

# Navigate and start
cd my-fullstack-app
pnpm dev
```

---

## Project Status

Zudolib is currently under active development.

The public API may change before the first stable release. Use packages with caution in production.

| Status       | Description                     |
| ------------ | ------------------------------- |
| Built        | Package implementation complete |
| Beta         | API may change                  |
| Experimental | Not recommended for production  |

All published packages are at version `0.1.x` and marked as **Built**.

---

## Installation

Zudolib packages can be installed individually.

```bash
pnpm add @zudoliblib/core
```

Install additional packages depending on the application requirements.

```bash
pnpm add @zudoliblib/http @zudoliblib/config @zudoliblib/logger
```

---

## Development

### Prerequisites

- Node.js >= 24
- pnpm >= 11

### Setup

```bash
git clone https://github.com/oyinlola-tech/zudolib.git
cd zudolib
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
pnpm run --filter=@zudoliblib/http typecheck
pnpm run --filter=@zudoliblib/http build
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

Zudolib is licensed under the MIT License.

See [LICENSE](./LICENSE) for details.
