/**
 * Queue error classes — re-exports from focused files.
 */

export {
  QueueError,
  createQueueError,
  isQueueError,
  toQueueError,
} from "./queueError.base.js";

export type { QueueErrorOptions } from "./queueError.base.js";

export {
  QueueConnectionError,
  QueueNotFoundError,
  QueueClosedError,
  QueueDisposedError,
} from "./queueError.queue.js";

export {
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
} from "./queueError.job.js";

export {
  WorkerError,
  WorkerNotFoundError,
  WorkerLifecycleError,
} from "./queueError.worker.js";
