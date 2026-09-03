/**
 * @zudolib/scheduler/types
 *
 * Core types for the Zudolib scheduler package.
 */

/**
 * Unique identifier for a scheduled job.
 */
export type SchedulerJobId = string;

/**
 * Unique identifier for a schedule.
 */
export type ScheduleId = string;

/**
 * Unique identifier for a job execution.
 */
export type ExecutionId = string;

/**
 * Type of schedule.
 */
export type ScheduleType = "once" | "delay" | "interval" | "cron";

/**
 * State of a schedule.
 */
export type ScheduleState = "active" | "paused" | "cancelled" | "completed";

/**
 * State of a job execution.
 */
export type JobState =
  "pending" | "running" | "completed" | "failed" | "cancelled" | "timed_out";

/**
 * Policy for handling overlapping executions.
 */
export type OverlapPolicy = "allow" | "skip" | "queue" | "replace";

/**
 * Policy for handling missed executions.
 */
export type MisfirePolicy = "skip" | "run-once" | "catch-up";

/**
 * Retry strategy.
 */
export type RetryStrategy = "fixed" | "linear" | "exponential";

/**
 * Retry policy for job executions.
 */
export interface RetryPolicy {
  readonly attempts: number;

  readonly strategy: RetryStrategy;

  readonly delay: number;

  readonly maxDelay?: number;

  readonly jitter?: boolean;
}

/**
 * Options for a scheduled job.
 */
export interface JobOptions {
  readonly timeout?: number;

  readonly retry?: RetryPolicy;

  readonly concurrency?: number;

  readonly overlap?: OverlapPolicy;
}

/**
 * Definition of a scheduled job.
 */
export interface JobDefinition {
  readonly id: SchedulerJobId;

  readonly name: string;

  readonly handler: JobHandler;

  readonly options?: JobOptions;
}

/**
 * Handler for a scheduled job.
 */
export type JobHandler<T = unknown> = (
  context: JobContext<T>,
) => Promise<void> | void;

/**
 * Context passed to a job handler during execution.
 */
export interface JobContext<T = unknown> {
  readonly jobId: SchedulerJobId;

  readonly executionId: ExecutionId;

  readonly scheduledAt: Date;

  readonly startedAt: Date;

  readonly attempt: number;

  readonly data: T;

  readonly signal: AbortSignal;
}

/**
 * Record of a job execution.
 */
export interface JobExecution {
  readonly id: ExecutionId;

  readonly jobId: SchedulerJobId;

  readonly scheduleId: ScheduleId;

  readonly status: JobState;

  readonly scheduledAt: Date;

  readonly startedAt?: Date;

  readonly completedAt?: Date;

  readonly duration?: number;

  readonly attempt: number;

  readonly error?: unknown;
}

/**
 * Result of a job execution.
 */
export interface JobExecutionResult {
  readonly success: boolean;

  readonly error?: unknown;
}

/**
 * Schedule definition.
 */
export interface Schedule {
  readonly id: ScheduleId;

  readonly jobId: SchedulerJobId;

  readonly type: ScheduleType;

  readonly expression?: string;

  readonly nextRunAt: Date;

  readonly lastRunAt?: Date;

  readonly state: ScheduleState;

  readonly options?: ScheduleOptions;
}

/**
 * Options for a schedule.
 */
export interface ScheduleOptions {
  readonly timezone?: string;

  readonly misfire?: MisfirePolicy;

  readonly priority?: number;
}

/**
 * Handle for controlling a schedule.
 */
export interface ScheduleHandle {
  readonly id: ScheduleId;

  readonly state: ScheduleState;

  pause(): Promise<void>;

  resume(): Promise<void>;

  cancel(): Promise<void>;

  nextRun(): Date | undefined;
}

/**
 * Trigger interface for calculating next execution time.
 */
export interface Trigger {
  next(after: Date): Date | null;
}
