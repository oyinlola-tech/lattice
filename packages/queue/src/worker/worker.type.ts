import type { Processor } from "../processor/processor.type.js";

import type { Queue } from "../queue/queue.type.js";

import type { QueueMiddleware } from "../middleware/middleware.type.js";

import type { WorkerState } from "../jobTypes/jobTypes.type.js";

/**
 * Options for creating a worker.
 */
export interface WorkerOptions {
  /** Maximum number of jobs to process concurrently. */
  readonly concurrency?: number;
  /** Poll interval in milliseconds. */
  readonly pollInterval?: number;
  /** Maximum number of stalled jobs before marking as failed. */
  readonly maxStalledCount?: number;
  /** Job timeout in milliseconds. */
  readonly timeoutMs?: number;
  /** Middleware for job processing. */
  readonly middleware?: QueueMiddleware[];
}

/**
 * Worker lifecycle states.
 */
export type WorkerLifecycleState = WorkerState;

/**
 * A worker that processes jobs from a queue.
 */
export interface Worker<TData = unknown> {
  /** Worker ID. */
  readonly id: string;
  /** Queue this worker processes jobs from. */
  readonly queue: Queue<TData>;
  /** Queue name. */
  readonly queueName: string;
  /** Current worker state. */
  readonly state: WorkerLifecycleState;
  /** Start processing jobs. */
  start(): Promise<void>;
  /** Stop processing jobs gracefully. */
  stop(): Promise<void>;
  /** Force stop processing jobs. */
  forceStop(): Promise<void>;
  /** Check if the worker is running. */
  isRunning(): boolean;
  /** Get worker statistics. */
  getStats(): WorkerStats;
}

/**
 * Worker statistics.
 */
export interface WorkerStats {
  /** Number of jobs processed. */
  readonly processed: number;
  /** Number of successful jobs. */
  readonly succeeded: number;
  /** Number of failed jobs. */
  readonly failed: number;
  /** Current concurrency. */
  readonly concurrency: number;
  /** Worker state. */
  readonly state: WorkerLifecycleState;
}
