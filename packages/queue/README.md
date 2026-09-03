# @zudoliblib/queue

Background job and asynchronous task infrastructure with in-memory and adapter-based queue implementations.

## Installation

```bash
npm install @zudoliblib/queue
```

## Quick Start

```typescript
import { createInMemoryQueue } from "@zudoliblib/queue";

const queue = createInMemoryQueue("emails", {
  concurrency: 5,
});

queue.process("send-email", async (job) => {
  await sendEmail(job.data.to, job.data.subject);
});

await queue.add("send-email", {
  to: "user@example.com",
  subject: "Welcome",
});
```

## Features

- In-memory queue for development and testing
- Pluggable queue adapters (Redis, Bull, etc.)
- Job retry with exponential backoff
- Dead letter queue for failed jobs
- Scheduled and delayed jobs
- Middleware pipeline for job processing
- Concurrency control

## Use Cases

- Background email sending
- Image and video processing
- Report generation
- Webhook delivery
- Any asynchronous workload
