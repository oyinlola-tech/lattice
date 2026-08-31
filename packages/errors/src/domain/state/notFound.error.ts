import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating a not-found error.
 */
export interface NotFoundErrorOptions extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
}

/**
 * Error raised when a requested resource cannot be found.
 */
export class NotFoundError extends BaseError {
  constructor(message = "The requested resource was not found.", options: NotFoundErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.RESOURCE_NOT_FOUND,
      category: options.category ?? ErrorCategory.RESOURCE,
      severity: options.severity ?? ErrorSeverity.INFO,
      statusCode: options.statusCode ?? 404,
      expose: options.expose ?? true,
      isOperational: options.isOperational ?? true,
    });
  }
}

/** Creates a not-found error. */
export function createNotFoundError(message = "The requested resource was not found.", options: NotFoundErrorOptions = {}): NotFoundError {
  return new NotFoundError(message, options);
}

/** Determines whether an unknown value is a NotFoundError. */
export function isNotFoundError(value: unknown): value is NotFoundError {
  return value instanceof NotFoundError;
}

/** Creates a not-found error for a specific resource. */
export function resourceNotFoundError(resource: string, identifier?: string | number): NotFoundError {
  const message = identifier !== undefined
    ? `${resource} with identifier "${String(identifier)}" was not found.`
    : `${resource} was not found.`;

  return new NotFoundError(message, {
    code: ErrorCode.RESOURCE_NOT_FOUND,
    category: ErrorCategory.RESOURCE,
    statusCode: 404,
    expose: true,
    metadata: { resource, ...(identifier !== undefined ? { identifier: String(identifier) } : {}) },
  });
}

/** Creates a not-found error for a database entity. */
export function entityNotFoundError(entity: string, identifier?: string | number): NotFoundError {
  const message = identifier !== undefined
    ? `${entity} with identifier "${String(identifier)}" was not found.`
    : `${entity} was not found.`;

  return new NotFoundError(message, {
    code: ErrorCode.RESOURCE_NOT_FOUND,
    category: ErrorCategory.RESOURCE,
    statusCode: 404,
    expose: true,
    metadata: { entity, ...(identifier !== undefined ? { identifier: String(identifier) } : {}) },
  });
}

/** Creates an error for a missing API route. */
export function routeNotFoundError(method: string, path: string): NotFoundError {
  return new NotFoundError(`Route ${method.toUpperCase()} ${path} was not found.`, {
    code: ErrorCode.ROUTE_NOT_FOUND,
    category: ErrorCategory.RESOURCE,
    statusCode: 404,
    expose: true,
    metadata: { method: method.toUpperCase(), path },
  });
}
