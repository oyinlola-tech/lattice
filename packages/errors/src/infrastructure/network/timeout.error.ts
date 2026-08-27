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
 * Timeout operation types used for diagnostics.
 */
export enum TimeoutOperation {
  UNKNOWN = "unknown",
  REQUEST = "request",
  DATABASE = "database",
  NETWORK = "network",
  CACHE = "cache",
  QUEUE = "queue",
  JOB = "job",
  LOCK = "lock",
  EXTERNAL_SERVICE = "external_service",
}

/**
 * Options for creating a timeout error.
 */
export interface TimeoutErrorOptions
  extends Omit<
    BaseErrorOptions,
    "category"
  > {
  readonly category?: ErrorCategory;

  /**
   * Operation that timed out.
   */
  readonly operation?: TimeoutOperation;

  /**
   * Timeout duration in milliseconds.
   */
  readonly timeoutMs?: number;

  /**
   * Name of the service or component that timed out.
   */
  readonly target?: string;
}

/**
 * Error raised when an operation exceeds its allowed execution time.
 */
export class TimeoutError
  extends BaseError {
  public readonly operation: TimeoutOperation;

  public readonly timeoutMs?: number;

  public readonly target?: string;

  constructor(
    message =
      "The operation timed out.",
    options: TimeoutErrorOptions = {},
  ) {
    validateTimeout(
      options.timeoutMs,
    );

    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.TIMEOUT,
        category:
          options.category ??
          ErrorCategory.TIMEOUT,
        severity:
          options.severity ??
          ErrorSeverity.WARNING,
        statusCode:
          options.statusCode ??
          504,
        expose:
          options.expose ??
          true,
        isOperational:
          options.isOperational ??
          true,
        metadata: {
          ...options.metadata,
          ...(options.operation !==
          undefined
            ? {
                operation:
                  options.operation,
              }
            : {}),
          ...(options.timeoutMs !==
          undefined
            ? {
                timeoutMs:
                  options.timeoutMs,
              }
            : {}),
          ...(options.target !==
          undefined
            ? {
                target:
                  options.target,
              }
            : {}),
        },
      },
    );

    this.operation =
      options.operation ??
      TimeoutOperation.UNKNOWN;

    this.timeoutMs =
      options.timeoutMs;

    this.target =
      options.target;
  }

  /**
   * Returns a serialized representation with timeout diagnostics.
   */
  public override toJSON() {
    return {
      ...super.toJSON(),
      operation:
        this.operation,
      ...(this.timeoutMs !==
      undefined
        ? {
            timeoutMs:
              this.timeoutMs,
          }
        : {}),
      ...(this.target !==
      undefined
        ? {
            target:
              this.target,
          }
        : {}),
    };
  }
}

/**
 * Creates a timeout error.
 */
export function createTimeoutError(
  message =
    "The operation timed out.",
  options: TimeoutErrorOptions = {},
): TimeoutError {
  return new TimeoutError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is a TimeoutError.
 */
export function isTimeoutError(
  value: unknown,
): value is TimeoutError {
  return (
    value instanceof TimeoutError
  );
}

/**
 * Creates a request timeout error.
 */
export function requestTimeoutError(
  timeoutMs?: number,
  target?: string,
): TimeoutError {
  return new TimeoutError(
    target
      ? `The request to ${target} timed out.`
      : "The request timed out.",
    {
      code:
        ErrorCode.TIMEOUT,
      operation:
        TimeoutOperation.REQUEST,
      timeoutMs,
      target,
    },
  );
}

/**
 * Creates a database timeout error.
 */
export function databaseTimeoutError(
  timeoutMs?: number,
  target?: string,
): TimeoutError {
  return new TimeoutError(
    target
      ? `The database operation on ${target} timed out.`
      : "The database operation timed out.",
    {
      code:
        ErrorCode.DATABASE_TIMEOUT,
      category:
        ErrorCategory.DATABASE,
      operation:
        TimeoutOperation.DATABASE,
      timeoutMs,
      target,
    },
  );
}

/**
 * Creates an external-service timeout error.
 */
export function serviceTimeoutError(
  target?: string,
  timeoutMs?: number,
): TimeoutError {
  return new TimeoutError(
    target
      ? `The request to ${target} timed out.`
      : "The external service request timed out.",
    {
      code:
        ErrorCode.EXTERNAL_SERVICE_TIMEOUT,
      category:
        ErrorCategory.EXTERNAL_SERVICE,
      operation:
        TimeoutOperation.EXTERNAL_SERVICE,
      timeoutMs,
      target,
    },
  );
}

/**
 * Creates a lock acquisition timeout error.
 */
export function lockTimeoutError(
  target?: string,
  timeoutMs?: number,
): TimeoutError {
  return new TimeoutError(
    target
      ? `Timed out while waiting for lock "${target}".`
      : "Timed out while waiting for a lock.",
    {
      code:
        ErrorCode.LOCK_TIMEOUT,
      category:
        ErrorCategory.CONFLICT,
      operation:
        TimeoutOperation.LOCK,
      timeoutMs,
      target,
      statusCode:
        409,
    },
  );
}

/**
 * Validates a timeout duration.
 */
function validateTimeout(
  timeoutMs: number | undefined,
): void {
  if (
    timeoutMs === undefined
  ) {
    return;
  }

  if (
    !Number.isFinite(
      timeoutMs,
    ) ||
    timeoutMs < 0
  ) {
    throw new RangeError(
      "timeoutMs must be a finite non-negative number.",
    );
  }
}