# @oyinlola141/lattice-queue

Background job and async task infrastructure — queues, workers, processors, retries, scheduling, and observability hooks.

## When to use

Import this when you need:

- enqueue jobs that should run outside the request cycle
- process jobs in a worker pool with retry and backoff
- schedule recurring jobs
- observe queue depth, latency, and failure rates

For one-off schedules (cron-like) use `@oyinlola141/lattice-scheduler`. For long-running workflows use `@oyinlola141/lattice-runtime` + lifecycle.

## Installation

```bash
npm install @oyinlola141/lattice-queue
```

## Public API

```typescript
import {
  createQueue,
  Queue,
  Worker,
  Processor,
  Job,
  InMemoryQueue,
  retryPolicy,
  exponentialBackoff,
  type JobOptions,
  type JobResult,
  type JobContext,
  type QueueEvents,
  type QueueEmitter,
  type JobHandler,
  type WorkerOptions,
} from "@oyinlola141/lattice-queue";
```

## Usage

```typescript
import { createQueue, exponentialBackoff } from "@oyinlola141/lattice-queue";

const emailQueue = createQueue<{ to: string; body: string }>({
  name: "email",
  retry: exponentialBackoff({ max: 5 }),
});

await emailQueue.enqueue({ to: "user@x.com", body: "Welcome" });

emailQueue.process(async (job) => {
  await sendEmail(job.data);
});
```

## License

MIT
