import type { Job } from "../job/job.type.js";
import type { Processor } from "../processor/processor.type.js";
import type { JobContext } from "../jobContext/jobContext.type.js";
import type { JobResult } from "../jobResult/jobResult.type.js";

import { updateJobState } from "../job/job.core.js";
import { JobState as JobStateEnum } from "../jobTypes/jobTypes.type.js";

import { createJobContext } from "../jobContext/jobContext.core.js";
import {
  createMiddlewareChain,
  createTimeoutMiddleware,
} from "../middleware/middleware.core.js";
import {
  calculateRetryDelay,
  shouldRetry,
} from "../retryPolicy/retryPolicy.core.js";
import { moveToDeadLetter } from "../deadLetter/deadLetter.core.js";

import { JobMaxAttemptsError } from "@zudoliblib/errors";

/**
 * Process a single job with middleware, retry, and failure handling.
 */
export async function processJob<TData>(
  job: Job<TData>,
  processor: Processor<TData>,
  middleware: import("../middleware/middleware.type.js").QueueMiddleware[],
  jobs: Map<string, Job<TData>>,
  options: { timeoutMs?: number },
  emitter: import("../queueEmitter/queueEmitter.type.js").QueueEventEmitter,
  deadLetterStore: import("../deadLetter/deadLetter.type.js").DeadLetterStore<TData>,
  counters: {
    processedCount: number;
    succeededCount: number;
    failedCount: number;
  },
): Promise<void> {
  const updatedJob = updateJobState(job, JobStateEnum.ACTIVE, {
    startedAt: new Date().toISOString() as never,
  });
  jobs.set(updatedJob.id, updatedJob);

  emitter.emit("job:started", { job: updatedJob });

  const abortController = new AbortController();
  const context = createJobContext<TData>(updatedJob, abortController.signal, {
    onProgress: async () => {
      const progressJob = updateJobState(updatedJob, JobStateEnum.ACTIVE);
      jobs.set(updatedJob.id, progressJob);
    },
  });

  const timeoutMs = options.timeoutMs ?? 30_000;
  const timeoutMiddleware = createTimeoutMiddleware(timeoutMs);
  const middlewareChain = createMiddlewareChain([
    timeoutMiddleware,
    ...middleware,
  ]);

  try {
    const result = await middlewareChain({
      job: updatedJob,
      context,
      next: async () => {
        return processor(updatedJob, context) as Promise<JobResult | void>;
      },
    });

    if (result && "success" in result && result.success) {
      const completedJob = updateJobState(updatedJob, JobStateEnum.COMPLETED, {
        completedAt: new Date().toISOString() as never,
      });
      jobs.set(updatedJob.id, completedJob);
      counters.succeededCount++;
      emitter.emit("job:completed", { job: completedJob, result: result.data });
    } else if (result && "success" in result && !result.success) {
      await handleJobFailure(
        updatedJob,
        result.error ?? "Job failed",
        processor,
        abortController,
        jobs,
        emitter,
        deadLetterStore,
        counters,
      );
    } else {
      const completedJob = updateJobState(updatedJob, JobStateEnum.COMPLETED, {
        completedAt: new Date().toISOString() as never,
      });
      jobs.set(updatedJob.id, completedJob);
      counters.succeededCount++;
      emitter.emit("job:completed", { job: completedJob, result: undefined });
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    await handleJobFailure(
      updatedJob,
      errorMessage,
      processor,
      abortController,
      jobs,
      emitter,
      deadLetterStore,
      counters,
    );
  } finally {
    counters.processedCount++;
  }
}

/**
 * Handle job failure with retry logic.
 */
export async function handleJobFailure<TData>(
  job: Job<TData>,
  errorMessage: string,
  processor: Processor<TData>,
  abortController: AbortController,
  jobs: Map<string, Job<TData>>,
  emitter: import("../queueEmitter/queueEmitter.type.js").QueueEventEmitter,
  deadLetterStore: import("../deadLetter/deadLetter.type.js").DeadLetterStore<TData>,
  counters: { failedCount: number },
): Promise<void> {
  const { updateJobState: update, incrementJobAttempt } =
    await import("../job/job.core.js");

  const failedJob = update(job, JobStateEnum.FAILED, {
    error: errorMessage,
    failedAt: new Date().toISOString() as never,
  });
  jobs.set(job.id, failedJob);
  counters.failedCount++;

  emitter.emit("job:failed", {
    job: failedJob,
    error: new Error(errorMessage),
  });

  const incrementedJob = incrementJobAttempt(failedJob);
  jobs.set(job.id, incrementedJob);

  if (shouldRetry(incrementedJob.attempt, incrementedJob.maxAttempts)) {
    const retryingJob = update(incrementedJob, JobStateEnum.RETRYING);
    jobs.set(job.id, retryingJob);

    emitter.emit("job:retrying", {
      job: retryingJob,
      attempt: incrementedJob.attempt,
    });

    const backoff = incrementedJob.backoff;
    const delay = calculateRetryDelay(incrementedJob.attempt, backoff);

    setTimeout(() => {
      const currentJob = jobs.get(job.id);
      if (currentJob && currentJob.state === JobStateEnum.RETRYING) {
        const waitingJob = update(currentJob, JobStateEnum.WAITING, {
          error: undefined,
          failedAt: undefined,
        });
        jobs.set(job.id, waitingJob);
      }
    }, delay);
  } else {
    const maxAttemptsError = new JobMaxAttemptsError(
      job.id,
      incrementedJob.attempt,
      incrementedJob.maxAttempts,
      { queueName: job.queueName },
    );
    await moveToDeadLetter(deadLetterStore, incrementedJob, maxAttemptsError);
    const deadLetterJob = update(incrementedJob, JobStateEnum.DEAD_LETTER, {
      error: maxAttemptsError.message,
    });
    jobs.set(job.id, deadLetterJob);
  }
}
