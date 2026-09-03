# @zudo/constants

Shared constants, enums, branded types, and type-safe literals for the Zudo framework.

## Installation

```bash
npm install @zudo/constants
```

## Quick Start

```typescript
import { EntityId, Timestamp, HttpStatus, ErrorCode } from "@zudo/constants";

const id: EntityId = "user_123";
const now: Timestamp = new Date();
const status = HttpStatus.OK;
```

## Features

- Branded ID types (EntityId, UserId, EventId, etc.)
- HTTP status codes and constants
- Error codes and categories
- Serialization tags and limits
- Type-safe literal types

## Use Cases

- Type-safe identifiers
- HTTP constants
- Error code management
- Shared enumerations
