import type { JobId, QueueName } from "../jobTypes/jobTypes.type.js";

import type { Job } from "../job/job.type.js";

import type { JobOptions } from "../jobOptions/jobOptions.type.js";

import type { Processor } from "../processor/processor.type.js";

import type { Serializer } from "../serializer/serializer.type.js";

import type { QueueMiddleware } from "../middleware/middleware.type.js";

import type { QueueEventEmitter } from "../queueEmitter/queueEmitter.type.js";

/**
 * Options for creating a queue.
 */
export interface QueueOptions {
  /** Queue concurrency limit. */
  readonly concurrency?: number;
  /** Default job options. */
  readonly defaultJobOptions?: Partial<JobOptions>;
  /** Serializer for job payloads. */
  readonly serializer?: Serializer;
  /** Middleware for job processing. */
  readonly middleware?: QueueMiddleware[];
  /** Poll interval in milliseconds. */
  readonly pollInterval?: number;
  /** Event emitter for queue lifecycle events. */
  readonly eventEmitter?: QueueEventEmitter;
}

/**
 * Statistics for a queue.
 */
export interface QueueStats {
  /** Number of waiting jobs. */
  readonly waiting: number;
  /** Number of active jobs. */
  readonly active: number;
  /** Number of completed jobs. */
  readonly completed: number;
  /** Number of failed jobs. */
  readonly failed: number;
  /** Number of delayed jobs. */
  readonly delayed: number;
  /** Number of retrying jobs. */
  readonly retrying: number;
}

/**
 * A named stream of jobs.
 */
export interface Queue<TData = unknown> {
  /** Queue name. */
  readonly name: QueueName;
  /** Add a job to the queue. */
  add(name: string, data: TData, options?: JobOptions): Promise<Job<TData>>;
  /** Process jobs with a processor. */
  process(name: string, processor: Processor<TData>): void;
  /** Get a job by ID. */
  getJob(jobId: JobId): Promise<Job<TData> | null>;
  /** Get the next available job for processing. */
  getNextJob(): Promise<Job<TData> | null>;
  /** Get a registered processor by job name. */
  getProcessor(name: string): Processor<TData> | undefined;
  /** Get queue statistics. */
  getStats(): Promise<QueueStats>;
  /** Pause the queue. */
  pause(): Promise<void>;
  /** Resume the queue. */
  resume(): Promise<void>;
  /** Check if the queue is paused. */
  isPaused(): boolean;
  /** Close the queue. */
  close(): Promise<void>;
}

/**
 * Event types emitted by a queue.
 */
export type QueueEventMap = {
  "job:created": { job: Job };
  "job:started": { job: Job };
  "job:progress": { job: Job; progress: number };
  "job:completed": { job: Job; result: unknown };
  "job:failed": { job: Job; error: Error };
  "job:retrying": { job: Job; attempt: number };
  "job:cancelled": { job: Job };
  "worker:started": { workerId: string };
  "worker:stopped": { workerId: string };
  "worker:error": { workerId: string; error: Error };
};
