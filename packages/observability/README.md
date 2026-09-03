# @zudolib/observability

Structured logging, metrics, tracing, context propagation, and exporters for Zudolib applications.

## Installation

```bash
npm install @zudolib/observability
```

## Quick Start

```typescript
import { createTracer, createMetricsRegistry } from "@zudolib/observability";

const tracer = createTracer({ service: "api" });
const metrics = createMetricsRegistry();

const span = tracer.startSpan("handle-request");
span.setAttribute("http.method", "GET");
await handleRequest();
span.end();
```

## Features

- Distributed tracing with span management
- Metrics registry (counters, gauges, histograms)
- Context propagation
- Log correlation with trace IDs
- Exporters (OTLP, Prometheus, etc.)

## Use Cases

- Distributed tracing
- Performance monitoring
- Error tracking
- SLA and SLO monitoring
