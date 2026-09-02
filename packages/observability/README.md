# @oyinlola141/lattice-observability

Metrics, traces, structured logs, and context propagation. Adapter-based so you can ship to OTLP, Prometheus, Datadog, or in-memory.

## When to use

Import this when you need:

- emit counters, gauges, histograms (`metrics.increment("req.count")`)
- create and end spans for distributed tracing
- correlate logs with trace IDs
- pluggable exporters (OTLP, memory, console)

For just structured logging, prefer `@oyinlola141/lattice-logger` (lighter).

## Installation

```bash
npm install @oyinlola141/lattice-observability
```

## Public API

```typescript
import {
  createMetrics,
  createTracer,
  createObservability,
  ConsoleExporter,
  MemoryExporter,
  OtlpExporter,
  type Metrics,
  type Tracer,
  type Span,
  type Observability,
  type Counter,
  type Histogram,
  type Gauge,
  type SpanContext,
  type TraceOptions,
} from "@oyinlola141/lattice-observability";
```

## Usage

```typescript
import {
  createTracer,
  createMetrics,
} from "@oyinlola141/lattice-observability";

const tracer = createTracer({ service: "api" });
const metrics = createMetrics();

const span = tracer.startSpan("db.query");
try {
  const rows = await db.query(sql);
  metrics.histogram("db.latency", 12, { table: "users" });
} finally {
  span.end();
}
```

## License

MIT
