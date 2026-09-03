import type { Timestamp } from "@zudo/constants";

/**
 * Result of a job execution.
 */
export interface JobResult<T = unknown> {
  /** Whether the job succeeded. */
  readonly success: boolean;
  /** The return value from the processor. */
  readonly data?: T;
  /** Error message if the job failed. */
  readonly error?: string;
  /** Duration of the job execution in milliseconds. */
  readonly durationMs: number;
  /** When the result was created. */
  readonly timestamp: Timestamp;
}

/**
 * Progress information for a job.
 */
export interface JobProgress {
  /** Progress percentage (0-100). */
  readonly percent: number;
  /** Current step or phase. */
  readonly step?: string;
  /** Total steps (if known). */
  readonly totalSteps?: number;
  /** Current step number. */
  readonly currentStep?: number;
  /** Optional message. */
  readonly message?: string;
  /** When the progress was updated. */
  readonly timestamp: Timestamp;
}
