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
 * Options for creating a network error.
 */
export interface NetworkErrorOptions
  extends Omit<
    BaseErrorOptions,
    "category"
  > {
  readonly category?: ErrorCategory;

  /**
   * URL or endpoint involved in the failed operation.
   *
   * Avoid including sensitive query parameters or credentials.
   */
  readonly endpoint?: string;

  /**
   * HTTP method involved in the failed request.
   */
  readonly method?: string;

  /**
   * HTTP status returned by the remote service, when available.
   */
  readonly responseStatus?: number;

  /**
   * Name of the remote service.
   */
  readonly service?: string;
}

/**
 * Error raised when a network request or connection fails.
 */
export class NetworkError
  extends BaseError {
  public readonly endpoint?: string;

  public readonly method?: string;

  public readonly responseStatus?: number;

  public readonly service?: string;

  constructor(
    message =
      "A network operation failed.",
    options: NetworkErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.NETWORK,
        category:
          options.category ??
          ErrorCategory.NETWORK,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ??
          502,
        expose:
          options.expose ??
          false,
        isOperational:
          options.isOperational ??
          true,
        metadata: {
          ...options.metadata,
          ...(options.endpoint !==
          undefined
            ? {
                endpoint:
                  options.endpoint,
              }
            : {}),
          ...(options.method !==
          undefined
            ? {
                method:
                  options.method.toUpperCase(),
              }
            : {}),
          ...(options.responseStatus !==
          undefined
            ? {
                responseStatus:
                  options.responseStatus,
              }
            : {}),
          ...(options.service !==
          undefined
            ? {
                service:
                  options.service,
              }
            : {}),
        },
      },
    );

    this.endpoint =
      options.endpoint;

    this.method =
      options.method?.toUpperCase();

    this.responseStatus =
      options.responseStatus;

    this.service =
      options.service;
  }

  /**
   * Returns a serialized representation with network diagnostics.
   */
  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.endpoint !==
      undefined
        ? {
            endpoint:
              this.endpoint,
          }
        : {}),
      ...(this.method !==
      undefined
        ? {
            method:
              this.method,
          }
        : {}),
      ...(this.responseStatus !==
      undefined
        ? {
            responseStatus:
              this.responseStatus,
          }
        : {}),
      ...(this.service !==
      undefined
        ? {
            service:
              this.service,
          }
        : {}),
    };
  }
}

/**
 * Creates a network error.
 */
export function createNetworkError(
  message =
    "A network operation failed.",
  options: NetworkErrorOptions = {},
): NetworkError {
  return new NetworkError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is a NetworkError.
 */
export function isNetworkError(
  value: unknown,
): value is NetworkError {
  return (
    value instanceof NetworkError
  );
}

/**
 * Creates a connection failure error.
 */
export function connectionFailedError(
  service?: string,
  options: Omit<
    NetworkErrorOptions,
    "service"
  > = {},
): NetworkError {
  return new NetworkError(
    service
      ? `Unable to connect to ${service}.`
      : "Unable to establish a network connection.",
    {
      ...options,
      code:
        ErrorCode.CONNECTION_FAILED,
      service,
    },
  );
}

/**
 * Creates a network timeout error.
 */
export function networkTimeoutError(
  service?: string,
  options: Omit<
    NetworkErrorOptions,
    "service"
  > = {},
): NetworkError {
  return new NetworkError(
    service
      ? `The request to ${service} timed out.`
      : "The network request timed out.",
    {
      ...options,
      code:
        ErrorCode.TIMEOUT,
      category:
        ErrorCategory.TIMEOUT,
      statusCode:
        options.statusCode ??
        504,
      service,
    },
  );
}

/**
 * Creates an error for an unavailable remote service.
 */
export function externalServiceUnavailableError(
  service?: string,
  options: Omit<
    NetworkErrorOptions,
    "service"
  > = {},
): NetworkError {
  return new NetworkError(
    service
      ? `${service} is currently unavailable.`
      : "The external service is currently unavailable.",
    {
      ...options,
      code:
        ErrorCode.EXTERNAL_SERVICE_UNAVAILABLE,
      category:
        ErrorCategory.EXTERNAL_SERVICE,
      statusCode:
        options.statusCode ??
        503,
      service,
    },
  );
}