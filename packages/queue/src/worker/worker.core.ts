import type { Queue } from "../queue/queue.type.js";

import type {
  Worker,
  WorkerOptions,
  WorkerStats,
  WorkerLifecycleState,
} from "./worker.type.js";

import { WorkerState } from "../jobTypes/jobTypes.type.js";

import { WorkerLifecycleError } from "@zudolib/errors";

/**
 * Creates a new Worker.
 */
export function createWorker<TData>(
  id: string,
  queue: Queue<TData>,
  options?: WorkerOptions,
): Worker<TData> {
  let state: WorkerLifecycleState = WorkerState.CREATED;
  let stats = { processed: 0, succeeded: 0, failed: 0, concurrency: 0 };
  const concurrency = options?.concurrency ?? 1;
  const pollInterval = options?.pollInterval ?? 100;
  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  let activeJobs = 0;
  let abortController: AbortController | null = null;

  const poll = async (): Promise<void> => {
    if (state !== WorkerState.RUNNING || abortController?.signal.aborted) {
      return;
    }

    if (activeJobs >= concurrency) {
      pollTimer = setTimeout(poll, pollInterval);
      return;
    }

    const job = await queue.getNextJob();
    if (!job) {
      pollTimer = setTimeout(poll, pollInterval);
      return;
    }

    const proc = queue.getProcessor(job.name);
    if (!proc) {
      pollTimer = setTimeout(poll, pollInterval);
      return;
    }

    activeJobs++;
    stats.processed++;

    try {
      await proc(
        job as never,
        {
          signal: abortController?.signal ?? new AbortController().signal,
        } as never,
      );
      stats.succeeded++;
    } catch {
      stats.failed++;
    } finally {
      activeJobs--;
      pollTimer = setTimeout(poll, 0);
    }
  };

  return {
    id,
    queue,
    queueName: queue.name,

    get state(): WorkerLifecycleState {
      return state;
    },

    async start(): Promise<void> {
      if (state !== WorkerState.CREATED && state !== WorkerState.STOPPED) {
        throw new WorkerLifecycleError(
          `Worker "${id}" cannot start from state "${state}".`,
          { workerId: id },
        );
      }

      state = WorkerState.STARTING;
      abortController = new AbortController();

      try {
        state = WorkerState.RUNNING;
        pollTimer = setTimeout(poll, 0);
      } catch (error) {
        state = WorkerState.FAILED;
        throw error;
      }
    },

    async stop(): Promise<void> {
      if (state !== WorkerState.RUNNING) {
        return;
      }

      state = WorkerState.DRAINING;
      abortController?.abort();

      while (activeJobs > 0) {
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }

      state = WorkerState.STOPPED;
    },

    async forceStop(): Promise<void> {
      abortController?.abort();

      if (pollTimer) {
        clearTimeout(pollTimer);
        pollTimer = null;
      }

      state = WorkerState.STOPPED;
    },

    isRunning(): boolean {
      return state === WorkerState.RUNNING;
    },

    getStats(): WorkerStats {
      return {
        ...stats,
        concurrency,
        state,
      };
    },
  };
}

/**
 * Checks if a value is a valid Worker.
 */
export function isWorker(value: unknown): value is Worker {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    "queueName" in value &&
    "state" in value &&
    "start" in value &&
    "stop" in value
  );
}
