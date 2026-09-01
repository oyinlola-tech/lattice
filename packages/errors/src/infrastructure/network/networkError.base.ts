/**
 * Base NetworkError class, options, and factory functions.
 */

import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/** Options for creating a network error. */
export interface NetworkErrorOptions extends Omit<
  BaseErrorOptions,
  "category"
> {
  readonly category?: ErrorCategory;
  readonly endpoint?: string;
  readonly method?: string;
  readonly responseStatus?: number;
  readonly service?: string;
}

/** Error raised when a network request or connection fails. */
export class NetworkError extends BaseError {
  public readonly endpoint?: string;
  public readonly method?: string;
  public readonly responseStatus?: number;
  public readonly service?: string;

  constructor(
    message = "A network operation failed.",
    options: NetworkErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.NETWORK,
      category: options.category ?? ErrorCategory.NETWORK,
      severity: options.severity ?? ErrorSeverity.ERROR,
      statusCode: options.statusCode ?? 502,
      expose: options.expose ?? false,
      isOperational: options.isOperational ?? true,
      metadata: {
        ...options.metadata,
        ...(options.endpoint !== undefined
          ? { endpoint: options.endpoint }
          : {}),
        ...(options.method !== undefined
          ? { method: options.method.toUpperCase() }
          : {}),
        ...(options.responseStatus !== undefined
          ? { responseStatus: options.responseStatus }
          : {}),
        ...(options.service !== undefined ? { service: options.service } : {}),
      },
    });
    this.endpoint = options.endpoint;
    this.method = options.method?.toUpperCase();
    this.responseStatus = options.responseStatus;
    this.service = options.service;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.endpoint !== undefined ? { endpoint: this.endpoint } : {}),
      ...(this.method !== undefined ? { method: this.method } : {}),
      ...(this.responseStatus !== undefined
        ? { responseStatus: this.responseStatus }
        : {}),
      ...(this.service !== undefined ? { service: this.service } : {}),
    };
  }
}

/** Creates a network error. */
export function createNetworkError(
  message = "A network operation failed.",
  options: NetworkErrorOptions = {},
): NetworkError {
  return new NetworkError(message, options);
}

/** Determines whether an unknown value is a NetworkError. */
export function isNetworkError(value: unknown): value is NetworkError {
  return value instanceof NetworkError;
}
