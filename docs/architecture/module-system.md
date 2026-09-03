# Module System

Zudolib applications are composed of modules.

## Module Definition

A module is a self-contained unit of functionality with explicit imports, exports, providers, and controllers.

```typescript
import { Module } from "@zudoliblib/core";

@Module({
  imports: [DatabaseModule, EventsModule],
  providers: [UserRepository, UserService],
  controllers: [UserController],
})
export class UsersModule {}
```

## Module Boundaries

Modules define explicit boundaries:

- **Imports** — other modules this module depends on.
- **Exports** — services this module exposes to other modules.
- **Providers** — services scoped to this module.
- **Controllers** — request handlers scoped to this module.

## Module Lifecycle

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

## Module Composition

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
