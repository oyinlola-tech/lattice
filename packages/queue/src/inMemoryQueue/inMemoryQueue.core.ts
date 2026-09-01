import {
  QueueError,
  QueueClosedError,
  QueueDisposedError,
  JobDuplicateError,
  JobMaxAttemptsError,
} from "@oyinlola141/lattice-errors";

import type { JobId, QueueName, JobState } from "../jobTypes/jobTypes.type.js";

import type { Job } from "../job/job.type.js";

import type { Queue, QueueOptions, QueueStats } from "../queue/queue.type.js";

import type { Processor } from "../processor/processor.type.js";

import type { JobOptions } from "../jobOptions/jobOptions.type.js";

import type { Serializer } from "../serializer/serializer.type.js";

import type { QueueMiddleware } from "../middleware/middleware.type.js";

import type { JobContext } from "../jobContext/jobContext.type.js";

import type { JobResult } from "../jobResult/jobResult.type.js";

import type { DeadLetterStore } from "../deadLetter/deadLetter.type.js";

import {
  createJob,
  updateJobState,
  incrementJobAttempt,
} from "../job/job.core.js";

import {
  createJobName,
  JobState as JobStateEnum,
} from "../jobTypes/jobTypes.type.js";

import { JsonSerializer } from "../serializer/serializer.core.js";

import {
  createMiddlewareChain,
  createTimeoutMiddleware,
} from "../middleware/middleware.core.js";

import { createJobContext } from "../jobContext/jobContext.core.js";

import {
  createJobResult,
  createJobProgress,
} from "../jobResult/jobResult.core.js";

import {
  calculateRetryDelay,
  shouldRetry,
} from "../retryPolicy/retryPolicy.core.js";

import {
  createInMemoryDeadLetterStore,
  moveToDeadLetter,
} from "../deadLetter/deadLetter.core.js";

import { createNoopQueueEventEmitter } from "../queueEmitter/queueEmitter.core.js";

import type { QueueEventEmitter } from "../queueEmitter/queueEmitter.type.js";

/**
 * In-memory queue implementation.
 *
 * Good for testing, development, and simple applications.
 * Jobs are lost when the application crashes.
 */
export class InMemoryQueue<TData = unknown> implements Queue<TData> {
  readonly name: QueueName;
  private readonly jobs: Map<JobId, Job<TData>> = new Map();
  private readonly processors: Map<string, Processor<TData>> = new Map();
  private readonly options: QueueOptions;
  private readonly serializer: Serializer;
  private readonly middleware: QueueMiddleware[];
  private paused = false;
  private disposed = false;
  private activeCount = 0;
  private pollTimer: ReturnType<typeof setTimeout> | null = null;
  private scheduledTimers: Map<JobId, ReturnType<typeof setTimeout>> =
    new Map();
  private readonly deduplicationIndex: Map<string, JobId> = new Map();
  private readonly deadLetterStore: DeadLetterStore<TData> =
    createInMemoryDeadLetterStore<TData>();
  private processedCount = 0;
  private succeededCount = 0;
  private failedCount = 0;
  private readonly emitter: QueueEventEmitter;

  constructor(name: QueueName, options?: QueueOptions) {
    this.name = name;
    this.options = options ?? {};
    this.serializer = this.options.serializer ?? JsonSerializer;
    this.middleware = this.options.middleware ?? [];
    this.emitter = options?.eventEmitter ?? createNoopQueueEventEmitter();
  }

  async add(
    jobName: string,
    data: TData,
    options?: JobOptions,
  ): Promise<Job<TData>> {
    if (this.disposed) {
      throw new QueueDisposedError(this.name);
    }

    if (this.paused) {
      throw new QueueError(`Queue "${this.name}" is paused.`, {
        queueName: this.name,
      });
    }

    const mergedOptions = {
      ...this.options.defaultJobOptions,
      ...options,
    };

    if (mergedOptions.deduplicationKey) {
      const existing = this.deduplicationIndex.get(
        mergedOptions.deduplicationKey,
      );
      if (existing && this.jobs.has(existing)) {
        throw new JobDuplicateError(existing, mergedOptions.deduplicationKey, {
          queueName: this.name,
        });
      }
    }

    const jobId =
      `job_${Date.now()}_${Math.random().toString(36).slice(2)}` as JobId;

    const job = createJob<TData>(
      {
        name: createJobName(jobName),
        queueName: this.name,
        data,
        options: mergedOptions,
      },
      jobId,
    );

    this.jobs.set(jobId, job);

    this.emitter.emit("job:created", { job });

    if (mergedOptions.deduplicationKey) {
      this.deduplicationIndex.set(mergedOptions.deduplicationKey, jobId);
    }

    if (job.state === JobStateEnum.SCHEDULED && job.scheduledAt) {
      this.scheduleJob(job);
    }

    return job;
  }

  process(name: string, processor: Processor<TData>): void {
    if (this.disposed) {
      throw new QueueDisposedError(this.name);
    }

    this.processors.set(name, processor);

    if (!this.pollTimer) {
      this.startPolling();
    }
  }

  async getJob(jobId: JobId): Promise<Job<TData> | null> {
    return this.jobs.get(jobId) ?? null;
  }

  async getNextJob(): Promise<Job<TData> | null> {
    if (this.paused || this.disposed) {
      return null;
    }

    const now = Date.now();
    let nextJob: Job<TData> | null = null;
    let nextPriority = -1;

    for (const job of this.jobs.values()) {
      if (job.state !== JobStateEnum.WAITING) {
        continue;
      }

      if (job.scheduledAt && new Date(job.scheduledAt).getTime() > now) {
        continue;
      }

      if (job.priority > nextPriority) {
        nextPriority = job.priority;
        nextJob = job;
      } else if (job.priority === nextPriority && nextJob) {
        const currentTime = new Date(job.createdAt).getTime();
        const nextTime = new Date(nextJob.createdAt).getTime();
        if (currentTime < nextTime) {
          nextJob = job;
        }
      }
    }

    return nextJob;
  }

  getProcessor(name: string): Processor<TData> | undefined {
    return this.processors.get(name);
  }

  async getStats(): Promise<QueueStats> {
    const allJobs = Array.from(this.jobs.values());
    return {
      waiting: allJobs.filter((j) => j.state === JobStateEnum.WAITING).length,
      active: allJobs.filter((j) => j.state === JobStateEnum.ACTIVE).length,
      completed: allJobs.filter((j) => j.state === JobStateEnum.COMPLETED)
        .length,
      failed: allJobs.filter(
        (j) =>
          j.state === JobStateEnum.FAILED ||
          j.state === JobStateEnum.DEAD_LETTER,
      ).length,
      delayed: allJobs.filter((j) => j.state === JobStateEnum.SCHEDULED).length,
      retrying: allJobs.filter((j) => j.state === JobStateEnum.RETRYING).length,
    };
  }

  async pause(): Promise<void> {
    this.paused = true;
  }

  async resume(): Promise<void> {
    this.paused = false;
  }

  isPaused(): boolean {
    return this.paused;
  }

  async close(): Promise<void> {
    this.stopPolling();
    this.clearScheduledTimers();
    this.jobs.clear();
    this.processors.clear();
    this.deduplicationIndex.clear();
    this.activeCount = 0;
    this.processedCount = 0;
    this.succeededCount = 0;
    this.failedCount = 0;
    this.paused = false;
    this.disposed = true;
  }

  private startPolling(): void {
    const pollInterval = this.options.concurrency ? 50 : 100;

    this.pollTimer = setTimeout(() => {
      this.pollTimer = null;
      this.processTick().finally(() => {
        if (!this.disposed && this.processors.size > 0) {
          this.startPolling();
        }
      });
    }, pollInterval);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private clearScheduledTimers(): void {
    for (const timer of this.scheduledTimers.values()) {
      clearTimeout(timer);
    }
    this.scheduledTimers.clear();
  }

  private async processTick(): Promise<void> {
    if (this.paused || this.disposed) {
      return;
    }

    const concurrency = this.options.concurrency ?? 1;
    const maxConcurrent = Math.max(1, concurrency);

    while (this.activeCount < maxConcurrent) {
      const job = await this.getNextJob();
      if (!job) {
        break;
      }

      const processor = this.processors.get(job.name);
      if (!processor) {
        continue;
      }

      this.activeCount++;
      this.runJob(job, processor)
        .catch(() => {})
        .finally(() => {
          this.activeCount--;
        });
    }

    this.scheduleDelayedJobs();
  }

  private async runJob(
    job: Job<TData>,
    processor: Processor<TData>,
  ): Promise<void> {
    const updatedJob = updateJobState(job, JobStateEnum.ACTIVE, {
      startedAt: new Date().toISOString() as never,
    });
    this.jobs.set(updatedJob.id, updatedJob);

    this.emitter.emit("job:started", { job: updatedJob });

    const abortController = new AbortController();
    const context = createJobContext<TData>(
      updatedJob,
      abortController.signal,
      {
        onProgress: async () => {
          const progressJob = updateJobState(updatedJob, JobStateEnum.ACTIVE);
          this.jobs.set(updatedJob.id, progressJob);
        },
      },
    );

    const timeoutMs = updatedJob.timeoutMs ?? 30_000;
    const timeoutMiddleware = createTimeoutMiddleware(timeoutMs);
    const middlewareChain = createMiddlewareChain([
      timeoutMiddleware,
      ...this.middleware,
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
        const completedJob = updateJobState(
          updatedJob,
          JobStateEnum.COMPLETED,
          {
            completedAt: new Date().toISOString() as never,
          },
        );
        this.jobs.set(updatedJob.id, completedJob);
        this.succeededCount++;
        this.emitter.emit("job:completed", {
          job: completedJob,
          result: result.data,
        });
      } else if (result && "success" in result && !result.success) {
        await this.handleJobFailure(
          updatedJob,
          result.error ?? "Job failed",
          processor,
          abortController,
        );
      } else {
        const completedJob = updateJobState(
          updatedJob,
          JobStateEnum.COMPLETED,
          {
            completedAt: new Date().toISOString() as never,
          },
        );
        this.jobs.set(updatedJob.id, completedJob);
        this.succeededCount++;
        this.emitter.emit("job:completed", {
          job: completedJob,
          result: undefined,
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);
      await this.handleJobFailure(
        updatedJob,
        errorMessage,
        processor,
        abortController,
      );
    } finally {
      this.processedCount++;
      this.cleanupDeduplication(updatedJob);
    }
  }

  private async handleJobFailure(
    job: Job<TData>,
    errorMessage: string,
    processor: Processor<TData>,
    abortController: AbortController,
  ): Promise<void> {
    const failedJob = updateJobState(job, JobStateEnum.FAILED, {
      error: errorMessage,
      failedAt: new Date().toISOString() as never,
    });
    this.jobs.set(job.id, failedJob);
    this.failedCount++;

    this.emitter.emit("job:failed", {
      job: failedJob,
      error: new Error(errorMessage),
    });

    const incrementedJob = incrementJobAttempt(failedJob);
    this.jobs.set(job.id, incrementedJob);

    if (shouldRetry(incrementedJob.attempt, incrementedJob.maxAttempts)) {
      const retryingJob = updateJobState(incrementedJob, JobStateEnum.RETRYING);
      this.jobs.set(job.id, retryingJob);

      this.emitter.emit("job:retrying", {
        job: retryingJob,
        attempt: incrementedJob.attempt,
      });

      const backoff = incrementedJob.backoff;
      const delay = calculateRetryDelay(incrementedJob.attempt, backoff);

      setTimeout(() => {
        const currentJob = this.jobs.get(job.id);
        if (currentJob && currentJob.state === JobStateEnum.RETRYING) {
          const waitingJob = updateJobState(currentJob, JobStateEnum.WAITING, {
            error: undefined,
            failedAt: undefined,
          });
          this.jobs.set(job.id, waitingJob);
        }
      }, delay);
    } else {
      const maxAttemptsError = new JobMaxAttemptsError(
        job.id,
        incrementedJob.attempt,
        incrementedJob.maxAttempts,
        { queueName: job.queueName },
      );
      await moveToDeadLetter(
        this.deadLetterStore,
        incrementedJob,
        maxAttemptsError,
      );
      const deadLetterJob = updateJobState(
        incrementedJob,
        JobStateEnum.DEAD_LETTER,
        {
          error: maxAttemptsError.message,
        },
      );
      this.jobs.set(job.id, deadLetterJob);
    }
  }

  private scheduleJob(job: Job<TData>): void {
    if (!job.scheduledAt) {
      return;
    }

    const scheduledTime = new Date(job.scheduledAt).getTime();
    const now = Date.now();
    const delay = Math.max(0, scheduledTime - now);

    const timer = setTimeout(() => {
      this.scheduledTimers.delete(job.id);
      const currentJob = this.jobs.get(job.id);
      if (currentJob && currentJob.state === JobStateEnum.SCHEDULED) {
        const waitingJob = updateJobState(currentJob, JobStateEnum.WAITING);
        this.jobs.set(job.id, waitingJob);
      }
    }, delay);

    this.scheduledTimers.set(job.id, timer);
  }

  private scheduleDelayedJobs(): void {
    const now = Date.now();
    for (const job of this.jobs.values()) {
      if (job.state === JobStateEnum.SCHEDULED && job.scheduledAt) {
        const scheduledTime = new Date(job.scheduledAt).getTime();
        if (scheduledTime <= now && !this.scheduledTimers.has(job.id)) {
          const waitingJob = updateJobState(job, JobStateEnum.WAITING);
          this.jobs.set(job.id, waitingJob);
        }
      }
    }
  }

  private cleanupDeduplication(job: Job<TData>): void {
    if (job.deduplicationKey) {
      this.deduplicationIndex.delete(job.deduplicationKey);
    }
  }
}

/**
 * Creates an InMemoryQueue.
 */
export function createInMemoryQueue<TData>(
  name: QueueName,
  options?: QueueOptions,
): InMemoryQueue<TData> {
  return new InMemoryQueue<TData>(name, options);
}
