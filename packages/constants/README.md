# @oyinlola141/lattice-constants

Shared constants, enums, and type-safe literals used across every Lattice package. Pure data, no behavior.

## When to use

Import this when you need:

- HTTP status codes / methods / headers (typed)
- Environment names (`development`, `production`, ...)
- Time units (ms, seconds, minutes) and durations
- Validation patterns (email, URL, UUID regex)
- Cache keys, priorities, and tag values
- Branded types (`EntityId`, `UserId`, `CorrelationId`, `Timestamp`)

## Installation

```bash
npm install @oyinlola141/lattice-constants
```

## Public API

```typescript
import {
  // HTTP
  HTTP_STATUS,
  HTTP_METHOD,
  HTTP_HEADER,
  CONTENT_TYPE,
  MIME_TYPE,

  // Environment
  ENVIRONMENT,
  NODE_ENV,
  APP_ENV,

  // Time
  TIME_UNIT,
  MS_PER_SECOND,
  DEFAULT_TIMEOUT,

  // Branded ID types
  type EntityId,
  type UserId,
  type EventId,
  type CorrelationId,
  type SessionId,
  type TenantId,
  type RequestId,
  type Timestamp,
  type Brand,

  // Validation patterns
  PATTERNS,
  EMAIL_PATTERN,
  UUID_PATTERN,
  URL_PATTERN,

  // Cache
  CACHE_TTL,
  CACHE_KEY_PREFIX,

  // Common
  DEFAULT_PORT,
  MAX_RETRIES,
  DEFAULT_PAGE_SIZE,
} from "@oyinlola141/lattice-constants";
```

## Usage

```typescript
import { HTTP_STATUS, type UserId } from "@oyinlola141/lattice-constants";

res.status(HTTP_STATUS.NOT_FOUND).json({ error: "missing" });

const id = "u_123" as UserId;
```

## License

MIT
