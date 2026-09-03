# Modules

Modules are the primary building blocks of a Zudolib application.

## Definition

A module is a self-contained unit of functionality:

```typescript
import { Module } from "@zudoliblib/core";

@Module({
  imports: [DatabaseModule, EventsModule],
  providers: [UserRepository, UserService],
  controllers: [UserController],
  exports: [UserService],
})
export class UsersModule {}
```

## Boundaries

Modules define explicit boundaries:

- **Imports** — other modules this module depends on.
- **Exports** — services this module exposes to other modules.
- **Providers** — services scoped to this module.
- **Controllers** — request handlers scoped to this module.

## Composition

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

## Lifecycle

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

## Isolation

Each module gets its own controlled context. Modules do not receive the entire application object. This enforces architectural boundaries and prevents hidden coupling.
