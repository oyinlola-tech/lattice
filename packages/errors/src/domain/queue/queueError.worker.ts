/**
 * Worker-specific error classes.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import { QueueError } from "./queueError.base.js";

/** Error thrown for worker failures. */
export class WorkerError extends QueueError {
  public readonly workerId?: string;
  constructor(message: string, options: { workerId?: string; queueName?: string; cause?: unknown } = {}) {
    super(message, { code: ErrorCode.WORKER_ERROR, queueName: options.queueName, cause: options.cause });
    this.workerId = options.workerId;
  }
}

/** Error thrown when a worker is not found. */
export class WorkerNotFoundError extends QueueError {
  constructor(workerId: string) {
    super(`Worker "${workerId}" was not found.`, {
      code: ErrorCode.WORKER_NOT_FOUND, statusCode: 404, expose: true,
    });
  }
}

/** Error thrown for worker lifecycle failures. */
export class WorkerLifecycleError extends QueueError {
  constructor(message: string, options: { workerId?: string; queueName?: string; cause?: unknown } = {}) {
    super(message, { code: ErrorCode.WORKER_LIFECYCLE, queueName: options.queueName, cause: options.cause });
  }
}
