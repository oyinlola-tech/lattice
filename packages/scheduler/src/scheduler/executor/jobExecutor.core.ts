import type { JobContext } from "../job/jobContext.type.js";

import type { JobDefinition } from "../job/jobDefinition.type.js";

import type { JobExecutionResult } from "../types/schedulerTypes.core.js";

import type { Clock } from "../clock/schedulerClock.type.js";

import { createJobContext } from "../job/jobContext.type.js";

import {
  SchedulerJobExecutionError,
  SchedulerJobCancelledError,
} from "../errors/scheduler.errors.js";

import { DEFAULT_JOB_TIMEOUT } from "../constants/schedulerConstants.core.js";

/**
 * Executes a job with timeout support.
 */
export class JobExecutor {
  private readonly clock: Clock;

  constructor(clock: Clock) {
    this.clock = clock;
  }

  /**
   * Executes a job.
   */
  async execute(
    job: JobDefinition,
    executionId: string,
    scheduledAt: Date,
    attempt: number,
    signal: AbortSignal,
  ): Promise<JobExecutionResult> {
    const timeout = job.options?.timeout ?? DEFAULT_JOB_TIMEOUT;

    const context = createJobContext(
      job.id,
      executionId,
      scheduledAt,
      this.clock.now(),
      attempt,
      undefined,
      signal,
    );

    try {
      await this.withTimeout(
        () => Promise.resolve(job.handler(context)),
        timeout,
        signal,
      );
      return { success: true };
    } catch (error) {
      if (signal.aborted) {
        throw new SchedulerJobCancelledError(
          "Job was cancelled via signal.",
          job.id,
        );
      }
      throw new SchedulerJobExecutionError(
        error instanceof Error ? error.message : "Unknown job execution error.",
        job.id,
      );
    }
  }

  /**
   * Wraps a promise with a timeout using AbortSignal.
   */
  private async withTimeout<T>(
    operation: () => Promise<T>,
    timeout: number,
    signal: AbortSignal,
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error(`Job timed out after ${timeout}ms.`));
      }, timeout);

      Promise.resolve()
        .then(() => Promise.resolve(operation()))
        .then((result) => {
          clearTimeout(timer);
          resolve(result);
        })
        .catch((error) => {
          clearTimeout(timer);
          reject(error);
        });
    });
  }
}
