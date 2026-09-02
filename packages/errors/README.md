# @oyinlola141/lattice-errors

Foundation error system for the entire Lattice platform. Every other package depends on this one.

## When to use

Import this whenever you need to:

- throw a typed, serializable error
- catch errors and check their category/severity/code
- build a custom error class for a new domain
- convert any error into a stable HTTP response

## Installation

```bash
npm install @oyinlola141/lattice-errors
```

## Public API

```typescript
import {
  // Base
  BaseError,
  ApplicationError,
  DomainError,

  // Categories / codes
  ErrorCode,
  ErrorCategory,
  ErrorSeverity,

  // Domain errors
  ValidationError,
  NotFoundError,
  ConflictError,
  AuthenticationError,
  AuthorizationError,
  RateLimitError,
  TimeoutError,

  // Infrastructure
  NetworkError,
  DatabaseError,
  StorageError,
  ExternalServiceError,
  HttpError,
  ConfigurationError,

  // System
  ContainerError,
  ModuleError,
  RuntimeError,
  EventError,
  LoggingError,
  MiddlewareError,
  CryptoError,

  // Serialization
  serializeError,
  deserializeError,
  isLatticeError,
  normalizeError,
} from "@oyinlola141/lattice-errors";
```

## Throwing errors

```typescript
import { NotFoundError, ErrorCode } from "@oyinlola141/lattice-errors";

throw new NotFoundError("User not found", {
  code: ErrorCode.USER_NOT_FOUND,
  metadata: { userId: "u_123" },
});
```

## Catching errors

```typescript
import { isLatticeError } from "@oyinlola141/lattice-errors";

try {
  await doSomething();
} catch (err) {
  if (isLatticeError(err)) {
    console.log(err.code, err.statusCode, err.isOperational);
  }
}
```

## License

MIT
