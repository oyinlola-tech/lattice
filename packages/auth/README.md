# @zudo/auth

Authentication primitives including JWT, sessions, password hashing, and RBAC delegation.

## Installation

```bash
npm install @zudo/auth
```

## Quick Start

```typescript
import { createJWTStrategy, createSessionStore } from "@zudo/auth";

const strategy = createJWTStrategy({
  secret: process.env.JWT_SECRET,
  expiresIn: "1h",
});

const token = await strategy.sign({ sub: user.id, role: user.role });
```

## Features

- JWT creation and verification
- Session management with stores
- Password hashing and verification
- RBAC delegation to `@zudo/permissions`
- Token refresh and revocation

## Use Cases

- API authentication
- Session-based login
- Password reset flows
- Role-based access control
