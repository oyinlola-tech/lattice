/**
 * Service error factory functions.
 */

import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ServiceError } from "./serviceError.base.js";

/** Creates a service unavailable error. */
export function serviceUnavailableError(service?: string): ServiceError {
  return new ServiceError(
    service
      ? `${service} is currently unavailable.`
      : "The service is currently unavailable.",
    {
      code: ErrorCode.SERVICE_UNAVAILABLE,
      category: ErrorCategory.SERVICE,
      statusCode: 503,
      service,
    },
  );
}

/** Creates a service initialization error. */
export function serviceInitializationError(
  service?: string,
  cause?: unknown,
): ServiceError {
  return new ServiceError(
    service
      ? `Failed to initialize ${service}.`
      : "Failed to initialize the service.",
    {
      code: ErrorCode.SERVICE_INITIALIZATION,
      category: ErrorCategory.SERVICE,
      statusCode: 500,
      service,
      cause,
      isOperational: false,
    },
  );
}

/** Creates a service operation failure. */
export function serviceOperationError(
  operation: string,
  service?: string,
): ServiceError {
  return new ServiceError(
    service
      ? `The ${operation} operation failed in ${service}.`
      : `The ${operation} operation failed.`,
    {
      code: ErrorCode.SERVICE_OPERATION,
      category: ErrorCategory.SERVICE,
      operation,
      service,
      statusCode: 500,
    },
  );
}
