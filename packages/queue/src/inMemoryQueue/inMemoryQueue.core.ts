import { randomBytes } from "node:crypto";
import {
  QueueError,
  QueueClosedError,
  QueueDisposedError,
  JobDuplicateError,
} from "@zudolib/errors";

import type { JobId, QueueName } from "../jobTypes/jobTypes.type.js";
import type { Job } from "../job/job.type.js";
import type { Queue, QueueOptions, QueueStats } from "../queue/queue.type.js";
import type { Processor } from "../processor/processor.type.js";
import type { JobOptions } from "../jobOptions/jobOptions.type.js";
import type { Serializer } from "../serializer/serializer.type.js";
import type { QueueMiddleware } from "../middleware/middleware.type.js";

import { createJob } from "../job/job.core.js";
import {
  JobState as JobStateEnum,
  createJobName,
} from "../jobTypes/jobTypes.type.js";
import { JsonSerializer } from "../serializer/serializer.core.js";
import { createInMemoryDeadLetterStore } from "../deadLetter/deadLetter.core.js";
import { createNoopQueueEventEmitter } from "../queueEmitter/queueEmitter.core.js";
import type { QueueEventEmitter } from "../queueEmitter/queueEmitter.type.js";
import type { DeadLetterStore } from "../deadLetter/deadLetter.type.js";

import { processJob } from "./inMemoryQueue.processing.js";
import {
  scheduleJob,
  scheduleDelayedJobs,
} from "./inMemoryQueue.scheduling.js";

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

  private emptySince = 0;

  private backoffMs = 50;

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
    if (this.disposed) throw new QueueDisposedError(this.name);
    if (this.paused)
      throw new QueueError(`Queue "${this.name}" is paused.`, {
        queueName: this.name,
      });

    const mergedOptions = { ...this.options.defaultJobOptions, ...options };

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
      `job_${Date.now()}_${randomBytes(6).toString("hex")}` as JobId;
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
      scheduleJob(job, this.scheduledTimers, this.jobs);
    }

    this.backoffMs = 50;
    this.emptySince = 0;

    return job;
  }

  process(name: string, processor: Processor<TData>): void {
    if (this.disposed) throw new QueueDisposedError(this.name);
    this.processors.set(name, processor);
    if (!this.pollTimer) this.startPolling();
  }

  async getJob(jobId: JobId): Promise<Job<TData> | null> {
    return this.jobs.get(jobId) ?? null;
  }

  async getNextJob(): Promise<Job<TData> | null> {
    if (this.paused || this.disposed) return null;

    const now = Date.now();
    let nextJob: Job<TData> | null = null;
    let nextPriority = -1;

    for (const job of this.jobs.values()) {
      if (job.state !== JobStateEnum.WAITING) continue;
      if (job.scheduledAt && new Date(job.scheduledAt).getTime() > now)
        continue;
      if (job.priority > nextPriority) {
        nextPriority = job.priority;
        nextJob = job;
      } else if (job.priority === nextPriority && nextJob) {
        const currentTime = new Date(job.createdAt).getTime();
        const nextTime = new Date(nextJob.createdAt).getTime();
        if (currentTime < nextTime) nextJob = job;
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
    for (const timer of this.scheduledTimers.values()) clearTimeout(timer);
    this.scheduledTimers.clear();
    this.jobs.clear();
    this.processors.clear();
    this.deduplicationIndex.clear();
    this.activeCount = 0;
    this.processedCount = 0;
    this.succeededCount = 0;
    this.failedCount = 0;
    this.paused = false;
    this.disposed = true;
    this.emptySince = 0;
    this.backoffMs = 50;
  }

  private startPolling(): void {
    const pollInterval = this.options.concurrency ? 50 : 100;
    this.pollTimer = setTimeout(() => {
      this.pollTimer = null;
      this.processTick().finally(() => {
        if (!this.disposed && this.processors.size > 0) this.scheduleNextTick();
      });
    }, pollInterval);
  }

  private scheduleNextTick(): void {
    if (this.disposed) return;
    const interval = this.backoffMs;
    this.pollTimer = setTimeout(() => {
      this.pollTimer = null;
      this.processTick().finally(() => {
        if (!this.disposed && this.processors.size > 0) this.scheduleNextTick();
      });
    }, interval);
  }

  private stopPolling(): void {
    if (this.pollTimer) {
      clearTimeout(this.pollTimer);
      this.pollTimer = null;
    }
  }

  private async processTick(): Promise<void> {
    if (this.paused || this.disposed) return;
    const concurrency = Math.max(1, this.options.concurrency ?? 1);

    let processed = 0;
    while (this.activeCount < concurrency) {
      const job = await this.getNextJob();
      if (!job) break;
      const processor = this.processors.get(job.name);
      if (!processor) continue;

      this.activeCount++;
      processed++;
      processJob(
        job,
        processor,
        this.middleware,
        this.jobs,
        { timeoutMs: job.timeoutMs },
        this.emitter,
        this.deadLetterStore,
        {
          processedCount: this.processedCount,
          succeededCount: this.succeededCount,
          failedCount: this.failedCount,
        },
      )
        .catch((error: unknown) => {
          this.emitter.emit("job:failed", {
            job,
            error: error instanceof Error ? error : new Error(String(error)),
          });
        })
        .finally(() => {
          this.activeCount--;
        });
    }

    if (processed > 0) {
      this.backoffMs = 50;
      this.emptySince = 0;
    } else if (this.emptySince === 0) {
      this.emptySince = Date.now();
      this.backoffMs = 50;
    } else {
      const elapsed = Date.now() - this.emptySince;
      if (elapsed > 500) {
        this.backoffMs = Math.min(this.backoffMs * 2, 2000);
      }
    }

    if (this.scheduledTimers.size > 0) {
      scheduleDelayedJobs(this.jobs);
    }
  }
}
