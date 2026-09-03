# @zudo/scheduler

Scheduled task and job infrastructure with cron-like scheduling, persistence, and worker management.

## Installation

```bash
npm install @zudo/scheduler
```

## Quick Start

```typescript
import { createScheduler } from "@zudo/scheduler";

const scheduler = createScheduler();

scheduler.add("cleanup", {
  cron: "0 0 * * *",
  handler: async () => {
    await cleanupOldRecords();
  },
});

await scheduler.start();
```

## Features

- Cron-like job scheduling
- Persistent job storage
- Worker management
- Job retry and backoff
- Job history and logs

## Use Cases

- Scheduled maintenance tasks
- Report generation
- Data cleanup jobs
- Periodic synchronization
