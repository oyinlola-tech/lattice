# @zudo/logger

Structured logging with transports, log levels, and context propagation for Lattice applications.

## Installation

```bash
npm install @zudo/logger
```

## Quick Start

```typescript
import { createLogger } from "@zudo/logger";

const logger = createLogger({ name: "api" });

logger.info("Server started", { port: 3000, env: "production" });
logger.error("Connection failed", { error: err.message });
```

## Features

- Structured JSON logging
- Log levels: debug, info, warn, error
- Multiple transports (console, file, HTTP)
- Child loggers with inherited context
- Correlation ID propagation
- Sensitive data redaction

## Use Cases

- Application logging
- Distributed tracing correlation
- Audit trails
- Debugging and monitoring
