import type { Job } from "../job/job.type.js";

import type { JobContext } from "../jobContext/jobContext.type.js";

import type { JobResult } from "../jobResult/jobResult.type.js";

/**
 * Context for queue middleware execution.
 */
export interface QueueMiddlewareContext<TData = unknown> {
  /** The job being processed. */
  readonly job: Job<TData>;
  /** Job context. */
  readonly context: JobContext<TData>;
  /** The next middleware or processor in the chain. */
  next(): Promise<JobResult | void>;
}

/**
 * Queue middleware function.
 */
export type QueueMiddleware<TData = unknown> = (
  ctx: QueueMiddlewareContext<TData>,
) => Promise<JobResult | void>;
