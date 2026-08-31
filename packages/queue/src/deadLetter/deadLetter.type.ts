import type { Job } from "../job/job.type.js";

import type { JobId } from "../jobTypes/jobTypes.type.js";

/**
 * Dead letter job with additional metadata.
 */
export interface DeadLetterJob<TData = unknown> {
  /** The original job. */
  readonly job: Job<TData>;
  /** When the job was moved to dead letter. */
  readonly deadLetterAt: Date;
  /** The error that caused the job to fail. */
  readonly error: Error;
  /** Number of attempts made. */
  readonly attempts: number;
  /** Optional reason for the failure. */
  readonly reason?: string;
}

/**
 * Interface for managing dead letter jobs.
 */
export interface DeadLetterStore<TData = unknown> {
  /** Add a job to the dead letter store. */
  add(deadLetterJob: DeadLetterJob<TData>): Promise<void>;
  /** Get a dead letter job by ID. */
  get(jobId: JobId): Promise<DeadLetterJob<TData> | null>;
  /** Get all dead letter jobs. */
  getAll(): Promise<DeadLetterJob<TData>[]>;
  /** Remove a dead letter job. */
  remove(jobId: JobId): Promise<boolean>;
  /** Clear all dead letter jobs. */
  clear(): Promise<void>;
}
