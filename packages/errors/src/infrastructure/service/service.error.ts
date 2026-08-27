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
 * Options for creating a service error.
 */
export interface ServiceErrorOptions
  extends Omit<
    BaseErrorOptions,
    "category"
  > {
  readonly category?: ErrorCategory;

  /**
   * Name of the service or application component.
   */
  readonly service?: string;

  /**
   * Operation being performed when the error occurred.
   */
  readonly operation?: string;
}

/**
 * Error raised by an application service or service-layer operation.
 */
export class ServiceError
  extends BaseError {
  public readonly service?: string;

  public readonly operation?: string;

  constructor(
    message =
      "A service operation failed.",
    options: ServiceErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.SERVICE_ERROR,
        category:
          options.category ??
          ErrorCategory.SERVICE,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ??
          500,
        expose:
          options.expose ??
          false,
        isOperational:
          options.isOperational ??
          true,
        metadata: {
          ...options.metadata,
          ...(options.service !==
          undefined
            ? {
                service:
                  options.service,
              }
            : {}),
          ...(options.operation !==
          undefined
            ? {
                operation:
                  options.operation,
              }
            : {}),
        },
      },
    );

    this.service =
      options.service;

    this.operation =
      options.operation;
  }

  /**
   * Returns a serialized representation with service diagnostics.
   */
  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.service !==
      undefined
        ? {
            service:
              this.service,
          }
        : {}),
      ...(this.operation !==
      undefined
        ? {
            operation:
              this.operation,
          }
        : {}),
    };
  }
}

/**
 * Creates a service error.
 */
export function createServiceError(
  message =
    "A service operation failed.",
  options: ServiceErrorOptions = {},
): ServiceError {
  return new ServiceError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is a ServiceError.
 */
export function isServiceError(
  value: unknown,
): value is ServiceError {
  return (
    value instanceof ServiceError
  );
}

/**
 * Creates a service unavailable error.
 */
export function serviceUnavailableError(
  service?: string,
): ServiceError {
  return new ServiceError(
    service
      ? `${service} is currently unavailable.`
      : "The service is currently unavailable.",
    {
      code:
        ErrorCode.SERVICE_UNAVAILABLE,
      category:
        ErrorCategory.SERVICE,
      statusCode:
        503,
      service,
    },
  );
}

/**
 * Creates a service initialization error.
 */
export function serviceInitializationError(
  service?: string,
  cause?: unknown,
): ServiceError {
  return new ServiceError(
    service
      ? `Failed to initialize ${service}.`
      : "Failed to initialize the service.",
    {
      code:
        ErrorCode.SERVICE_INITIALIZATION,
      category:
        ErrorCategory.SERVICE,
      statusCode:
        500,
      service,
      cause,
      isOperational:
        false,
    },
  );
}

/**
 * Creates a service operation failure.
 */
export function serviceOperationError(
  operation: string,
  service?: string,
): ServiceError {
  return new ServiceError(
    service
      ? `The ${operation} operation failed in ${service}.`
      : `The ${operation} operation failed.`,
    {
      code:
        ErrorCode.SERVICE_OPERATION,
      category:
        ErrorCategory.SERVICE,
      operation,
      service,
      statusCode:
        500,
    },
  );
}