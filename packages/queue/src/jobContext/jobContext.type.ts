import type { Job } from "../job/job.type.js";

import type { JobProgress } from "../jobResult/jobResult.type.js";

/**
 * Context provided to a job processor during execution.
 */
export interface JobContext<TData = unknown> {
  /** The job being processed. */
  readonly job: Job<TData>;
  /** AbortSignal for cancellation support. */
  readonly signal: AbortSignal;
  /** Update job progress. */
  updateProgress(progress: JobProgress): Promise<void>;
  /** Log a message with job context. */
  log(message: string, data?: Record<string, unknown>): void;
}
