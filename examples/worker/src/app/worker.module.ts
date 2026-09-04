/**
 * Worker module.
 *
 * Composes processors and manages the worker lifecycle.
 */

import { createInMemoryQueue, createWorker } from "@zudojs/queue";
import type { Queue, Worker } from "@zudojs/queue";
import { createQueueName } from "@zudojs/queue";
import { EmailProcessor } from "../processors/email.processor.js";
import { ReportProcessor } from "../processors/report.processor.js";
import { CleanupProcessor } from "../processors/cleanup.processor.js";
import type {
  SendEmailJobData,
  GenerateReportJobData,
  CleanupJobData,
} from "../jobs/jobs.types.js";

export interface WorkerModuleOptions {
  readonly concurrency?: number;
  readonly jobTimeoutMs?: number;
}

export class WorkerModule {
  public readonly id = "worker";
  public readonly name = "Worker Module";
  public readonly version = "0.1.0";

  private emailQueue: Queue<SendEmailJobData> | undefined;
  private reportQueue: Queue<GenerateReportJobData> | undefined;
  private cleanupQueue: Queue<CleanupJobData> | undefined;

  private emailWorker: Worker<SendEmailJobData> | undefined;
  private reportWorker: Worker<GenerateReportJobData> | undefined;
  private cleanupWorker: Worker<CleanupJobData> | undefined;

  private readonly options: WorkerModuleOptions;

  public constructor(options: WorkerModuleOptions = {}) {
    this.options = options;
  }

  public async initialize(): Promise<void> {
    const concurrency = this.options.concurrency ?? 1;
    const jobTimeoutMs = this.options.jobTimeoutMs ?? 30_000;

    // Create queues
    this.emailQueue = createInMemoryQueue<SendEmailJobData>(
      createQueueName("emails"),
      {
        concurrency,
      },
    );

    this.reportQueue = createInMemoryQueue<GenerateReportJobData>(
      createQueueName("reports"),
      {
        concurrency,
      },
    );

    this.cleanupQueue = createInMemoryQueue<CleanupJobData>(
      createQueueName("cleanup"),
      {
        concurrency: 1,
      },
    );

    // Register processors
    const emailProcessor = new EmailProcessor();
    const reportProcessor = new ReportProcessor();
    const cleanupProcessor = new CleanupProcessor();

    this.emailQueue.process(
      emailProcessor.name,
      emailProcessor.process.bind(emailProcessor),
    );
    this.reportQueue.process(
      reportProcessor.name,
      reportProcessor.process.bind(reportProcessor),
    );
    this.cleanupQueue.process(
      cleanupProcessor.name,
      cleanupProcessor.process.bind(cleanupProcessor),
    );

    // Create workers
    this.emailWorker = createWorker("email-worker", this.emailQueue, {
      concurrency,
      timeoutMs: jobTimeoutMs,
    });

    this.reportWorker = createWorker("report-worker", this.reportQueue, {
      concurrency,
      timeoutMs: jobTimeoutMs,
    });

    this.cleanupWorker = createWorker("cleanup-worker", this.cleanupQueue, {
      concurrency: 1,
      timeoutMs: jobTimeoutMs,
    });
  }

  public async start(): Promise<void> {
    console.log("[WorkerModule] Starting workers...");

    await Promise.all([
      this.emailWorker?.start(),
      this.reportWorker?.start(),
      this.cleanupWorker?.start(),
    ]);

    console.log("[WorkerModule] All workers started");
  }

  public async stop(): Promise<void> {
    console.log("[WorkerModule] Stopping workers...");

    await Promise.all([
      this.emailWorker?.stop(),
      this.reportWorker?.stop(),
      this.cleanupWorker?.stop(),
    ]);

    console.log("[WorkerModule] All workers stopped");
  }

  public getEmailQueue(): Queue<SendEmailJobData> {
    if (!this.emailQueue) {
      throw new Error("WorkerModule has not been initialized.");
    }
    return this.emailQueue;
  }

  public getReportQueue(): Queue<GenerateReportJobData> {
    if (!this.reportQueue) {
      throw new Error("WorkerModule has not been initialized.");
    }
    return this.reportQueue;
  }

  public getCleanupQueue(): Queue<CleanupJobData> {
    if (!this.cleanupQueue) {
      throw new Error("WorkerModule has not been initialized.");
    }
    return this.cleanupQueue;
  }
}
