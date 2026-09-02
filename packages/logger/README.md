# @oyinlola141/lattice-logger

Structured, transport-agnostic logging with levels, transports, redaction, and child loggers.

## When to use

Import this when you need:

- a logger that emits JSON, text, or custom formats
- pluggable transports (console, file, OTLP, memory, ...)
- level filtering (trace, debug, info, warn, error, fatal)
- child loggers that inherit context (correlation ID, user ID, ...)
- automatic redaction of sensitive fields
- per-module log configuration

## Installation

```bash
npm install @oyinlola141/lattice-logger
```

## Public API

```typescript
import {
  createLogger,
  logger,
  ConsoleTransport,
  MemoryTransport,
  JsonFormatter,
  TextFormatter,
  LogLevel,
  type Logger,
  type LogEntry,
  type LogTransport,
  type LoggerOptions,
} from "@oyinlola141/lattice-logger";
```

## Usage

```typescript
import {
  createLogger,
  ConsoleTransport,
  JsonFormatter,
} from "@oyinlola141/lattice-logger";

const log = createLogger({
  level: "info",
  transports: [new ConsoleTransport({ formatter: new JsonFormatter() })],
});

log.info("server.started", { port: 3000 });

const reqLog = log.child({ correlationId: "c_1" });
reqLog.warn("auth.failed", { reason: "expired" });
```

## License

MIT
