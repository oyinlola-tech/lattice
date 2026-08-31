/**
 * Base queue error class and types.
 */

import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/** Options for creating a queue error. */
export interface QueueErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly queueName?: string;
  readonly jobId?: string;
}

/** Base error for all queue subsystem failures. */
export class QueueError extends BaseError {
  public readonly queueName?: string;
  public readonly jobId?: string;

  constructor(
    message: string,
    options: QueueErrorOptions = {},
  ) {
    super(message, {
      code: options.code ?? ErrorCode.QUEUE_ERROR,
      category: options.category ?? ErrorCategory.QUEUE,
      severity: options.severity ?? ErrorSeverity.WARNING,
      cause: options.cause,
      metadata: options.metadata,
      expose: options.expose ?? false,
      isOperational: options.isOperational ?? true,
    });
    this.queueName = options.queueName;
    this.jobId = options.jobId;
  }
}

/** Check if an error is a QueueError. */
export function isQueueError(
  error: unknown,
): error is QueueError {
  return error instanceof QueueError;
}

/** Convert an unknown error to a QueueError. */
export function toQueueError(
  error: unknown,
  options: Partial<QueueErrorOptions> = {},
): QueueError {
  if (error instanceof QueueError) {
    return error;
  }
  const message =
    error instanceof Error ? error.message : String(error);
  return new QueueError(message, {
    cause: error,
    ...options,
  });
}

/** Create a QueueError from options. */
export function createQueueError(
  message: string,
  options: QueueErrorOptions = {},
): QueueError {
  return new QueueError(message, options);
}
