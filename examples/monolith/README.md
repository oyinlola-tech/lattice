# Zudolib Monolith Example

A reference architecture for building modular monoliths with the Zudolib framework.

## Architecture

This example demonstrates a modular monolith with 6 bounded-context modules:

- **identity** — User registration and authentication
- **users** — User profile management
- **products** — Product catalog with inventory
- **orders** — Order processing with CQRS and domain events
- **payments** — Payment processing
- **notifications** — Event-driven notification dispatch

### Layered Structure

```
src/
├── shared/                  # Cross-cutting concerns
│   ├── domain/              # Base entity, aggregate root, value object
│   ├── application/         # Command/query base classes
│   └── infrastructure/      # Shared in-memory store, ID generators
├── config/                  # App and HTTP configuration
├── bootstrap/               # Application wiring
├── modules/
│   ├── identity/            # Authentication and registration
│   ├── users/               # User management
│   ├── products/            # Product catalog
│   ├── orders/              # Order processing (CQRS + events)
│   ├── payments/            # Payment processing
│   └── notifications/       # Event-driven notifications
└── main.ts                  # Entry point and demo flow
```

### Key Patterns

- **Feature-first modules** — Each module owns its domain, application, and infrastructure
- **CQRS** — Commands write state; queries read state (via `@zudolib/cqrs`)
- **Domain Events** — Cross-module communication via `DomainEvent` on aggregate roots
- **Aggregate Roots** — Business rules enforced at the aggregate boundary
- **Repository Pattern** — Domain defines contracts; infrastructure provides implementations
- **Dependency Inversion** — Domain layer has zero framework or infrastructure imports

## Getting Started

```bash
# Install dependencies
pnpm install

# Typecheck
npx tsc --noEmit

# Run
npx tsx src/main.ts
```

## Tech Stack

- TypeScript 7.x (strict, ESM)
- Node.js ≥ 24
- `@zudolib/cqrs` — Command/query buses
- `@zudolib/events` — Event bus with middleware
- `@zudolib/config` — Layered configuration
- `@zudolib/errors` — Structured error hierarchy
- `@zudolib/validation` — Zod-based validation
- `@zudolib/logger` — Structured logging

## Demo Flow

`main.ts` demonstrates:

1. Seeding a user and products
2. Creating an order via `CreateOrderCommand`
3. Domain events dispatched (`order.created`, `order.confirmed`)
4. Notifications module reacting to events
5. Querying the order and user orders

## Configuration

Copy `.env.example` to `.env` and adjust values. The app uses `@zudolib/config` to resolve sources in priority order:

1. Environment variables
2. Config files (`.env`, `config.json`)
3. Default values

## Testing

```bash
npx vitest run
```
