/**
 * Context passed to a job handler during execution.
 */
export interface JobContext<T = unknown> {
  readonly jobId: string;

  readonly executionId: string;

  readonly scheduledAt: Date;

  readonly startedAt: Date;

  readonly attempt: number;

  readonly data: T;

  readonly signal: AbortSignal;
}

/**
 * Creates a job context.
 */
export function createJobContext<T = unknown>(
  jobId: string,
  executionId: string,
  scheduledAt: Date,
  startedAt: Date,
  attempt: number,
  data: T,
  signal: AbortSignal,
): JobContext<T> {
  return Object.freeze({
    jobId,
    executionId,
    scheduledAt,
    startedAt,
    attempt,
    data,
    signal,
  });
}
