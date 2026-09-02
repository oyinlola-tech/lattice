# @oyinlola141/lattice-container

Token-based dependency injection container. Register providers by token (string, symbol, or class), resolve them at any depth, and use scoped lifetimes (singleton, transient, request, session).

## When to use

Import this when you need:

- a single composition root for your application
- testable seam points (swap implementations by token)
- request-scoped or session-scoped services
- async provider factories (e.g. database clients)
- circular-dependency detection and resolution
- hierarchical containers (parent/child scopes)

## Installation

```bash
npm install @oyinlola141/lattice-container
```

## Public API

```typescript
import {
  createContainer,
  Container,
  token,
  type Token,
  type Provider,
  type ContainerOptions,
  type RegistrationOptions,
  type Scope,
} from "@oyinlola141/lattice-container";
```

## Usage

```typescript
import { createContainer, token } from "@oyinlola141/lattice-container";

const LOGGER = token<Logger>("logger");
const DB = token<Database>("db");

const c = createContainer();

c.register(LOGGER, { useValue: console });
c.register(DB, { useFactory: async () => openDb(), scope: "singleton" });

const db = await c.resolve(DB);
```

## License

MIT
