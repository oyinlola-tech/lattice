# Worker Example

A background worker application built with Zudojs.

## Demonstrates

- Background job processing with queues
- Multiple job types (email, report, cleanup)
- Job retry with exponential backoff
- Worker lifecycle management
- Graceful shutdown
- In-memory queue (for development/testing)

## Architecture

```
Queue
  |
  +-- Email Queue --> EmailProcessor
  |
  +-- Report Queue --> ReportProcessor (with retry)
  |
  +-- Cleanup Queue --> CleanupProcessor
```

## Project Structure

```
src/
├── main.ts                  # Application entry point
├── config/
│   └── config.ts            # Worker configuration
├── app/
│   └── worker.module.ts     # Worker module (queues + workers)
├── jobs/
│   └── jobs.types.ts        # Job data type definitions
└── processors/
    ├── email.processor.ts   # Email job processor
    ├── report.processor.ts  # Report job processor (with retry)
    └── cleanup.processor.ts # Cleanup job processor
```

## Installation

From the repository root:

```bash
npm install
```

## Run

```bash
# From the examples/worker directory
npm run dev

# Or from the repository root
npm run dev --workspace=@zudojs/example-worker
```

## What It Does

1. Starts three workers (email, report, cleanup)
2. Queues example jobs
3. Processes jobs with retry and backoff
4. Prints statistics
5. Shuts down gracefully

## Job Types

| Job               | Description        | Retry                                 |
| ----------------- | ------------------ | ------------------------------------- |
| `send-email`      | Sends an email     | No                                    |
| `generate-report` | Generates a report | Yes (3 attempts, exponential backoff) |
| `cleanup`         | Cleans up old data | No                                    |

## Configuration

Environment variables (see `.env.example`):

| Variable             | Default       | Description                 |
| -------------------- | ------------- | --------------------------- |
| `NODE_ENV`           | `development` | Environment                 |
| `WORKER_CONCURRENCY` | `5`           | Max concurrent jobs         |
| `JOB_TIMEOUT_MS`     | `30000`       | Job timeout in milliseconds |

## Queue Statistics

After processing, the worker prints:

```
--- Queue Statistics ---
Emails:   2 completed, 0 failed
Reports:  1 completed, 0 failed
Cleanup:  1 completed, 0 failed
```
