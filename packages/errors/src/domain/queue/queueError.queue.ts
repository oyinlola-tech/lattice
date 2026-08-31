/**
 * Queue-specific error classes.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import { QueueError } from "./queueError.base.js";

/** Error raised when queue connection fails. */
export class QueueConnectionError extends QueueError {
  constructor(queueName: string, message?: string, cause?: unknown) {
    super(message ?? `Failed to connect to queue "${queueName}".`, {
      code: ErrorCode.QUEUE_CONNECTION,
      queueName,
      cause,
    });
  }
}

/** Error raised when a queue is not found. */
export class QueueNotFoundError extends QueueError {
  constructor(queueName: string) {
    super(`Queue "${queueName}" was not found.`, {
      code: ErrorCode.QUEUE_NOT_FOUND,
      queueName,
      statusCode: 404,
      expose: true,
    });
  }
}

/** Error raised when a queue is closed. */
export class QueueClosedError extends QueueError {
  constructor(queueName: string) {
    super(`Queue "${queueName}" is closed.`, {
      code: ErrorCode.QUEUE_CLOSED,
      queueName,
      statusCode: 500,
      expose: false,
    });
  }
}

/** Error raised when a queue has been disposed. */
export class QueueDisposedError extends QueueError {
  constructor(queueName: string) {
    super(`Queue "${queueName}" has already been disposed.`, {
      code: ErrorCode.QUEUE_DISPOSED,
      queueName,
      statusCode: 500,
      isOperational: false,
    });
  }
}
