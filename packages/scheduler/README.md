# @oyinlola141/lattice-scheduler

Cron-style and interval-based job scheduling with a system clock abstraction for testability.

## When to use

Import this when you need:

- run a function on a cron schedule (`*/5 * * * *`)
- run a function at a fixed interval
- run a function once at a future time
- use a fake clock in tests (`createSystemClock`)

For distributed work queues use `@oyinlola141/lattice-queue`.

## Installation

```bash
npm install @oyinlola141/lattice-scheduler
```

## Public API

```typescript
import {
  createSchedule,
  ScheduleHandleImpl,
  SystemClock,
  createSystemClock,
  parseDuration,
  JobRegistry,
  JobExecutor,
  PriorityQueue,
  Scheduler,
  type Schedule,
  type ScheduleHandle,
  type JobDefinition,
} from "@oyinlola141/lattice-scheduler";
```

## Usage

```typescript
import { createSchedule, Scheduler } from "@oyinlola141/lattice-scheduler";

const sched = new Scheduler({ clock: createSystemClock() });

sched.add(
  createSchedule("0 */6 * * *", async () => {
    await runReport();
  }),
);

sched.start();
```

## License

MIT
