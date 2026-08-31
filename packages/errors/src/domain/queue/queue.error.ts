import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";

import {
  ErrorCategory,
} from "../../base/types/errorCategory.type.js";

import {
  ErrorCode,
} from "../../base/types/errorCode.type.js";

import {
  ErrorSeverity,
} from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating a queue error.
 */
export interface QueueErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly queueName?: string;
  readonly jobId?: string;
}

/**
 * Base error for all queue subsystem failures.
 */
export class QueueError extends BaseError {
  public readonly queueName?: string;
  public readonly jobId?: string;

  constructor(
    message: string,
    options: QueueErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.QUEUE_ERROR,
        category:
          options.category ??
          ErrorCategory.QUEUE,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ?? 500,
        expose:
          options.expose ?? false,
        isOperational:
          options.isOperational ?? true,
      },
    );

    this.queueName = options.queueName;
    this.jobId = options.jobId;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.queueName !== undefined
        ? { queueName: this.queueName }
        : {}),
      ...(this.jobId !== undefined
        ? { jobId: this.jobId }
        : {}),
    };
  }
}

/**
 * Creates a queue error.
 */
export function createQueueError(
  message: string,
  options: QueueErrorOptions = {},
): QueueError {
  return new QueueError(message, options);
}

/**
 * Determines whether an unknown value is a QueueError.
 */
export function isQueueError(
  value: unknown,
): value is QueueError {
  return value instanceof QueueError;
}

/**
 * Converts an unknown thrown value into a QueueError.
 */
export function toQueueError(
  error: unknown,
  options: {
    message?: string;
    queueName?: string;
    jobId?: string;
    code?: string;
  } = {},
): QueueError {
  if (error instanceof QueueError) {
    return error;
  }

  if (error instanceof Error) {
    return new QueueError(
      options.message ?? error.message,
      {
        code: options.code as ErrorCode | undefined,
        queueName: options.queueName,
        jobId: options.jobId,
        cause: error,
      },
    );
  }

  return new QueueError(
    options.message ?? String(error),
    {
      code: options.code as ErrorCode | undefined,
      queueName: options.queueName,
      jobId: options.jobId,
      cause: error,
    },
  );
}

/**
 * Error raised when queue connection fails.
 */
export class QueueConnectionError extends QueueError {
  constructor(
    queueName: string,
    message?: string,
    cause?: unknown,
  ) {
    super(
      message ??
        `Failed to connect to queue "${queueName}".`,
      {
        code:
          ErrorCode.QUEUE_CONNECTION,
        queueName,
        cause,
      },
    );
  }
}

/**
 * Error raised when a queue is not found.
 */
export class QueueNotFoundError extends QueueError {
  constructor(queueName: string) {
    super(
      `Queue "${queueName}" was not found.`,
      {
        code: ErrorCode.QUEUE_NOT_FOUND,
        queueName,
        statusCode: 404,
        expose: true,
      },
    );
  }
}

/**
 * Error raised when a queue is closed.
 */
export class QueueClosedError extends QueueError {
  constructor(queueName: string) {
    super(
      `Queue "${queueName}" is closed.`,
      {
        code: ErrorCode.QUEUE_CLOSED,
        queueName,
        statusCode: 500,
        expose: false,
      },
    );
  }
}

/**
 * Error raised when a queue has been disposed.
 */
export class QueueDisposedError extends QueueError {
  constructor(queueName: string) {
    super(
      `Queue "${queueName}" has already been disposed.`,
      {
        code: ErrorCode.QUEUE_DISPOSED,
        queueName,
        statusCode: 500,
        isOperational: false,
      },
    );
  }
}

/**
 * Error thrown for general job failures.
 */
export class JobError extends QueueError {
  constructor(
    message: string,
    options: {
      queueName?: string;
      jobId?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.JOB_ERROR,
      queueName: options.queueName,
      jobId: options.jobId,
      cause: options.cause,
    });
  }
}

/**
 * Error thrown when a job is not found.
 */
export class JobNotFoundError extends QueueError {
  constructor(
    jobId: string,
    queueName?: string,
  ) {
    super(
      `Job "${jobId}" was not found${queueName ? ` in queue "${queueName}"` : ""}.`,
      {
        code: ErrorCode.JOB_NOT_FOUND,
        queueName,
        jobId,
        statusCode: 404,
        expose: true,
      },
    );
  }
}

/**
 * Error thrown when a job times out.
 */
export class JobTimeoutError extends QueueError {
  public readonly timeoutMs: number;

  constructor(
    jobId: string,
    timeoutMs: number,
    options: {
      queueName?: string;
    } = {},
  ) {
    super(
      `Job "${jobId}" exceeded the timeout of ${timeoutMs}ms.`,
      {
        code: ErrorCode.JOB_TIMEOUT,
        queueName: options.queueName,
        jobId,
        metadata: { timeoutMs },
        statusCode: 504,
      },
    );

    this.timeoutMs = timeoutMs;
  }
}

/**
 * Error thrown when a job is cancelled.
 */
export class JobCancelledError extends QueueError {
  constructor(
    jobId: string,
    options: {
      queueName?: string;
      reason?: string;
    } = {},
  ) {
    super(
      `Job "${jobId}" was cancelled${options.reason ? `: ${options.reason}` : ""}.`,
      {
        code: ErrorCode.JOB_CANCELLED,
        queueName: options.queueName,
        jobId,
        statusCode: 499,
        expose: false,
      },
    );
  }
}

/**
 * Error thrown when job serialization fails.
 */
export class JobSerializationError extends QueueError {
  constructor(
    jobId: string,
    message: string,
    options: {
      queueName?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.JOB_SERIALIZATION,
      queueName: options.queueName,
      jobId,
      cause: options.cause,
    });
  }
}

/**
 * Error thrown when job deserialization fails.
 */
export class JobDeserializationError
  extends QueueError {
  constructor(
    jobId: string,
    message: string,
    options: {
      queueName?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.JOB_DESERIALIZATION,
      queueName: options.queueName,
      jobId,
      cause: options.cause,
    });
  }
}

/**
 * Error thrown when job processing fails.
 */
export class JobProcessingError extends QueueError {
  constructor(
    jobId: string,
    message: string,
    options: {
      queueName?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.JOB_PROCESSING,
      queueName: options.queueName,
      jobId,
      cause: options.cause,
    });
  }
}

/**
 * Error thrown when a duplicate job is detected.
 */
export class JobDuplicateError extends QueueError {
  constructor(
    jobId: string,
    deduplicationKey: string,
    options: {
      queueName?: string;
    } = {},
  ) {
    super(
      `Duplicate job detected with key "${deduplicationKey}".`,
      {
        code: ErrorCode.JOB_DUPLICATE,
        queueName: options.queueName,
        jobId,
        statusCode: 409,
        expose: true,
      },
    );
  }
}

/**
 * Error thrown when max attempts exceeded.
 */
export class JobMaxAttemptsError extends QueueError {
  public readonly attempt: number;
  public readonly maxAttempts: number;

  constructor(
    jobId: string,
    attempt: number,
    maxAttempts: number,
    options: {
      queueName?: string;
    } = {},
  ) {
    super(
      `Job "${jobId}" exceeded maximum attempts (${maxAttempts}).`,
      {
        code: ErrorCode.JOB_MAX_ATTEMPTS,
        queueName: options.queueName,
        jobId,
        metadata: { attempt, maxAttempts },
      },
    );

    this.attempt = attempt;
    this.maxAttempts = maxAttempts;
  }
}

/**
 * Error thrown when a job is stalled.
 */
export class JobStalledError extends QueueError {
  constructor(
    jobId: string,
    options: {
      queueName?: string;
    } = {},
  ) {
    super(
      `Job "${jobId}" has stalled.`,
      {
        code: ErrorCode.JOB_STALLED,
        queueName: options.queueName,
        jobId,
      },
    );
  }
}

/**
 * Error thrown for worker failures.
 */
export class WorkerError extends QueueError {
  public readonly workerId?: string;

  constructor(
    message: string,
    options: {
      workerId?: string;
      queueName?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.WORKER_ERROR,
      queueName: options.queueName,
      cause: options.cause,
    });

    this.workerId = options.workerId;
  }
}

/**
 * Error thrown when a worker is not found.
 */
export class WorkerNotFoundError extends QueueError {
  constructor(workerId: string) {
    super(
      `Worker "${workerId}" was not found.`,
      {
        code: ErrorCode.WORKER_NOT_FOUND,
        statusCode: 404,
        expose: true,
      },
    );
  }
}

/**
 * Error thrown for worker lifecycle failures.
 */
export class WorkerLifecycleError extends QueueError {
  constructor(
    message: string,
    options: {
      workerId?: string;
      queueName?: string;
      cause?: unknown;
    } = {},
  ) {
    super(message, {
      code: ErrorCode.WORKER_LIFECYCLE,
      queueName: options.queueName,
      cause: options.cause,
    });
  }
}
