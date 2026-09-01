/**
 * Test queue helpers.
 *
 * Wraps the real InMemoryQueue with recording and assertion support.
 */

import { createInMemoryQueue } from "@oyinlola141/lattice-queue";

import type {
  Job,
  JobId,
  QueueName,
  QueueOptions,
  QueueStats,
  Processor,
  JobOptions,
} from "@oyinlola141/lattice-queue";

/**
 * A recorded job addition.
 */
export interface RecordedJob<TData = unknown> {
  readonly job: Job<TData>;
  readonly timestamp: Date;
}

/**
 * A test queue with recording capabilities.
 */
export interface TestQueue<TData = unknown> {
  readonly queue: InMemoryQueue<TData>;

  /**
   * All recorded jobs.
   */
  readonly jobs: readonly RecordedJob<TData>[];

  /**
   * Add a job and record it.
   */
  add: (name: string, data: TData, options?: JobOptions) => Promise<Job<TData>>;

  /**
   * Find jobs by name.
   */
  findByName: (name: string) => readonly RecordedJob<TData>[];

  /**
   * Get all job states.
   */
  getStats: () => Promise<QueueStats>;

  /**
   * Clear recorded jobs.
   */
  clear: () => void;

  /**
   * Close the queue.
   */
  close: () => Promise<void>;
}

import { InMemoryQueue } from "@oyinlola141/lattice-queue";

/**
 * Creates a test queue with recording.
 *
 * @param name - Queue name.
 * @param options - Queue options.
 * @returns A TestQueue instance.
 *
 * @example
 * ```ts
 * const testQueue = createTestQueue("emails");
 *
 * testQueue.queue.process("send-email", async (job) => {
 *   await sendEmail(job.data);
 * });
 *
 * await testQueue.add("send-email", { to: "user@example.com" });
 *
 * expect(testQueue.jobs).toHaveLength(1);
 * expect(testQueue.findByName("send-email")).toHaveLength(1);
 *
 * await testQueue.close();
 * ```
 */
export function createTestQueue<TData = unknown>(
  name: QueueName,
  options?: QueueOptions,
): TestQueue<TData> {
  const queue = createInMemoryQueue<TData>(name, options);
  const recordedJobs: RecordedJob<TData>[] = [];

  const add = async (
    jobName: string,
    data: TData,
    jobOptions?: JobOptions,
  ): Promise<Job<TData>> => {
    const job = await queue.add(jobName, data, jobOptions);

    recordedJobs.push({
      job,
      timestamp: new Date(),
    });

    return job;
  };

  const findByName = (name: string): readonly RecordedJob<TData>[] =>
    recordedJobs.filter((r) => r.job.name === name);

  const getStats = async (): Promise<QueueStats> => queue.getStats();

  const clear = (): void => {
    recordedJobs.length = 0;
  };

  const close = async (): Promise<void> => {
    await queue.close();
  };

  return {
    queue,
    jobs: recordedJobs,
    add,
    findByName,
    getStats,
    clear,
    close,
  };
}
