# @oyinlola141/lattice-auth

Authentication and authorization services — JWT, sessions, RBAC, OAuth2, password hashing, and provider abstractions. Higher-level than `@oyinlola141/lattice-permissions`.

## When to use

Import this when you need:

- issue and verify JWTs
- manage sessions (create, refresh, revoke)
- hash and verify passwords
- plug in an external auth provider (Auth0, Clerk, Cognito, ...)
- a ready-made RBAC layer

## Installation

```bash
npm install @oyinlola141/lattice-auth
```

## Public API

```typescript
import {
  jwt,
  hashPassword,
  verifyPassword,
  createSessionStore,
  createAuthProvider,
  createAuthService,
  type JWT,
  type JWTOptions,
  type JWTPayload,
  type Session,
  type SessionStore,
  type SessionOptions,
  type AuthProvider,
  type AuthService,
  type AuthResult,
  type PasswordHasher,
  type AuthError,
  type AuthErrorOptions,
} from "@oyinlola141/lattice-auth";
```

## Usage

```typescript
import { jwt, hashPassword, verifyPassword } from "@oyinlola141/lattice-auth";

const token = await jwt.sign(
  { sub: "u_1", role: "admin" },
  { secret: process.env.JWT_SECRET },
);
const payload = await jwt.verify(token, { secret: process.env.JWT_SECRET });

const hash = await hashPassword("hunter2");
const ok = await verifyPassword(hash, "hunter2");
```

## License

MIT
