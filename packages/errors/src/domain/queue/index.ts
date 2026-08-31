/**
 * Queue, job, and worker error classes.
 *
 * Provides error types for queue operations, job lifecycle,
 * and worker management.
 */
export {
  QueueError,
  createQueueError,
  isQueueError,
  toQueueError,
  QueueConnectionError,
  QueueNotFoundError,
  QueueClosedError,
  QueueDisposedError,
  JobError,
  JobNotFoundError,
  JobTimeoutError,
  JobCancelledError,
  JobSerializationError,
  JobDeserializationError,
  JobProcessingError,
  JobDuplicateError,
  JobMaxAttemptsError,
  JobStalledError,
  WorkerError,
  WorkerNotFoundError,
  WorkerLifecycleError,
} from "./queue.error.js";

export type { QueueErrorOptions } from "./queue.error.js";
