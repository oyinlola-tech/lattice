# Lattice

A modular TypeScript framework for building scalable, maintainable, and production-ready applications — backend, frontend, or fullstack.

---

## What is Lattice?

Lattice is a modular TypeScript application framework designed to provide a consistent foundation for building backend services, APIs, distributed systems, frontend applications, and fullstack platforms.

Instead of forcing applications into a single architecture, Lattice provides independent packages for common infrastructure concerns such as dependency injection, configuration, HTTP, events, messaging, database access, queues, security, observability, and runtime lifecycle management.

Applications can use only the packages they need while maintaining consistent contracts across the ecosystem.

---

## Why Lattice?

Modern applications often need more than an HTTP server.

As systems grow, concerns such as configuration, dependency injection, background jobs, events, messaging, transactions, observability, security, storage, multi-tenancy, and feature flags need to work together consistently.

Lattice provides a modular foundation for these concerns without requiring every application to adopt the same runtime or deployment model.

---

## Core Philosophy

### Modular

Use only what the application needs. Every package is independent.

```
Application
     |
     +-- @lattice/core
     +-- @lattice/http
     +-- @lattice/database
     +-- @lattice/events
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

The application is not tightly coupled to a specific database, queue, cloud provider, or storage backend. The `@lattice/adapters` package defines the boundary between Lattice and external platforms.

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

Lattice is organized as an npm workspaces monorepo. Each package has a focused responsibility and a clear dependency boundary.

---

## Packages

### Foundation

| Package               | Description                                           |
| --------------------- | ----------------------------------------------------- |
| `@lattice/core`       | Lifecycle, context, runtime, modules                  |
| `@lattice/runtime`    | Application lifecycle orchestrator                    |
| `@lattice/container`  | DI container with token-based registration            |
| `@lattice/config`     | Layered configuration with sources                    |
| `@lattice/errors`     | Shared error base class and utilities                 |
| `@lattice/validation` | Schema validation with Zod                            |
| `@lattice/logger`     | Structured logging with transports                    |
| `@lattice/lifecycle`  | State machine, dependency ordering, graceful shutdown |
| `@lattice/constants`  | Shared constants, enums, and type-safe literals       |
| `@lattice/types`      | Shared type guards and utility types                  |
| `@lattice/middleware` | Composable middleware pipeline                        |

### Application

| Package                  | Description                                |
| ------------------------ | ------------------------------------------ |
| `@lattice/http`          | HTTP primitives, request handling, routing |
| `@lattice/schema`        | Schema definition and parsing engine       |
| `@lattice/serialization` | Data translation layer                     |
| `@lattice/cqrs`          | Command query responsibility segregation   |
| `@lattice/cli`           | Command-line interface                     |

### Data and Infrastructure

| Package                 | Description                                  |
| ----------------------- | -------------------------------------------- |
| `@lattice/database`     | Database clients, repositories, transactions |
| `@lattice/storage`      | Storage abstractions and lifecycle           |
| `@lattice/queue`        | Background job infrastructure                |
| `@lattice/messaging`    | In-process message bus                       |
| `@lattice/transactions` | Transaction lifecycle and coordination       |
| `@lattice/cache`        | Cache abstraction with adapters              |

### Security

| Package                | Description                                 |
| ---------------------- | ------------------------------------------- |
| `@lattice/security`    | Input validation, CORS, CSRF, rate limiting |
| `@lattice/crypto`      | Cryptographic primitives                    |
| `@lattice/auth`        | JWT, sessions, password hashing             |
| `@lattice/permissions` | RBAC, ABAC, resource authorization          |

### Platform

| Package                  | Description                           |
| ------------------------ | ------------------------------------- |
| `@lattice/observability` | Metrics, tracing, context propagation |
| `@lattice/tenancy`       | Multi-tenant context and isolation    |
| `@lattice/feature-flags` | Feature flag evaluation and rollouts  |
| `@lattice/adapters`      | Boundary layer for external platforms |

### Development

| Package            | Description                   |
| ------------------ | ----------------------------- |
| `@lattice/testing` | Test helpers, fixtures, mocks |
| `@lattice/docs`    | Documentation infrastructure  |

---

## CLI — Project Generation

Lattice includes a CLI for scaffolding projects, adding features, and managing architecture.

### Installation

```bash
npm install -g zudo-cli
```

### Supported Frontend Frameworks

Lattice can generate frontend and fullstack projects with any of the following frameworks:

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

- **Lattice Standard** — Global concerns organized by domain (`components/`, `services/`, `utils/`, `types/`, etc.)
- **Feature Based** — Domain-driven feature folders with shared global utilities
- **Minimal** — Only essential folders for small projects
- **Framework Default** — Let the framework decide the structure

### How Frontend Generation Works

When you create a frontend or fullstack project, Lattice:

1. **Scaffolds the framework** using the official project template (Vite, Next.js CLI, Angular CLI, etc.)
2. **Applies Lattice structure** on top of the generated project:
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
lattice create my-system \
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

Lattice configures the generated frontend to communicate with the backend:

- **Development proxy** — API requests are proxied to the backend during development
- **Type-safe client** — Generated API client from backend schema (when using OpenAPI)
- **Shared types** — Common TypeScript types in the workspace `packages/shared/` directory
- **Environment management** — Separate `.env` files for development, staging, and production

### Creating a Project

#### Backend Only

```bash
lattice create my-api
```

Options:

```bash
lattice create my-api \
  --architecture monolith \
  --package-manager pnpm \
  --database postgresql \
  --api rest
```

#### Frontend Only

```bash
lattice create my-web \
  --type frontend \
  --frontend react \
  --frontend-architecture lattice-standard
```

#### Full Stack

```bash
lattice create my-system \
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
lattice add queue
lattice add database
lattice add cache
lattice add storage
```

### Development Server

```bash
lattice dev
```

Starts all applications in the workspace with a single command.

- **Backend only** — Starts the API server with hot reload
- **Frontend only** — Starts the frontend dev server
- **Fullstack** — Starts both backend and frontend concurrently

Options:

```bash
lattice dev --frontend-only   # Start only the frontend
lattice dev --backend-only    # Start only the backend
lattice dev --port 3000       # Custom port for backend
```

---

## Quick Start

### Backend

```ts
import { createApplication } from "@lattice/runtime";
import { createHTTPServer } from "@lattice/http";

const app = await createApplication();

const server = createHTTPServer({ app });

server.get("/", () => {
  return { message: "Hello from Lattice" };
});

await app.start();
```

### Fullstack

```bash
# Create a fullstack project
lattice create my-fullstack-app \
  --type fullstack \
  --frontend react \
  --architecture monolith

# Navigate and start
cd my-fullstack-app
pnpm dev
```

---

## Project Status

Lattice is currently under active development.

The public API may change before the first stable release. Use packages with caution in production.

| Status       | Description                     |
| ------------ | ------------------------------- |
| Built        | Package implementation complete |
| Beta         | API may change                  |
| Experimental | Not recommended for production  |

All published packages are at version `0.1.x` and marked as **Built**.

---

## Installation

Lattice packages can be installed individually.

```bash
pnpm add @lattice/core
```

Install additional packages depending on the application requirements.

```bash
pnpm add @lattice/http @lattice/config @lattice/logger
```

---

## Development

### Prerequisites

- Node.js >= 24
- pnpm >= 11

### Setup

```bash
git clone https://github.com/oyinlola-tech/lattice.git
cd lattice
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
pnpm run --filter=@lattice/http typecheck
pnpm run --filter=@lattice/http build
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

Lattice is licensed under the MIT License.

See [LICENSE](./LICENSE) for details.
