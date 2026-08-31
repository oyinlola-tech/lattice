import type { Job } from "../job/job.type.js";

import type { JobContext } from "../jobContext/jobContext.type.js";

import type { JobResult } from "../jobResult/jobResult.type.js";

/**
 * A function that processes a job.
 */
export type Processor<TData = unknown, TResult = unknown> = (
  job: Job<TData>,
  context: JobContext<TData>,
) => Promise<JobResult<TResult>> | Promise<void>;

/**
 * Metadata about a registered processor.
 */
export interface ProcessorInfo {
  /** The job name this processor handles. */
  readonly jobName: string;
  /** When the processor was registered. */
  readonly registeredAt: Date;
  /** Optional description. */
  readonly description?: string;
}

/**
 * Registry for job processors.
 */
export interface ProcessorRegistry {
  /** Register a processor for a job type. */
  register<TData, TResult>(
    jobName: string,
    processor: Processor<TData, TResult>,
    options?: { description?: string },
  ): void;
  /** Get a processor by job name. */
  get<TData, TResult>(
    jobName: string,
  ): Processor<TData, TResult> | undefined;
  /** Check if a processor is registered. */
  has(jobName: string): boolean;
  /** Get all registered processor info. */
  getAll(): ProcessorInfo[];
  /** Remove a processor. */
  unregister(jobName: string): boolean;
  /** Clear all processors. */
  clear(): void;
}

/**
 * Checks if a value is a valid Processor.
 */
export function isProcessor(
  value: unknown,
): value is Processor {
  return typeof value === "function";
}
