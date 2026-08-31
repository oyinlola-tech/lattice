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
 * Options for creating an adapter error.
 */
export interface AdapterErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly adapter?: string;
}

/**
 * Base error for all adapter failures.
 */
export class AdapterError extends BaseError {
  public readonly adapter?: string;

  constructor(
    message: string,
    options: AdapterErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.ADAPTER_OPERATION_FAILED,
        category:
          options.category ??
          ErrorCategory.SERVICE,
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

    this.adapter = options.adapter;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.adapter !== undefined
        ? { adapter: this.adapter }
        : {}),
    };
  }
}

/**
 * Creates an adapter error.
 */
export function createAdapterError(
  message: string,
  options: AdapterErrorOptions = {},
): AdapterError {
  return new AdapterError(message, options);
}

/**
 * Determines whether an unknown value is an AdapterError.
 */
export function isAdapterError(
  value: unknown,
): value is AdapterError {
  return value instanceof AdapterError;
}

/**
 * Error thrown when an adapter is not found.
 */
export class AdapterNotFoundError extends AdapterError {
  constructor(
    adapterName: string,
  ) {
    super(
      `Adapter "${adapterName}" is not registered.`,
      {
        code: ErrorCode.ADAPTER_NOT_FOUND,
        adapter: adapterName,
        statusCode: 404,
        expose: true,
      },
    );

    this.name = "AdapterNotFoundError";
  }
}

/**
 * Error thrown when an adapter is already registered.
 */
export class AdapterAlreadyRegisteredError extends AdapterError {
  constructor(
    adapterName: string,
  ) {
    super(
      `Adapter "${adapterName}" is already registered.`,
      {
        code: ErrorCode.ADAPTER_ALREADY_REGISTERED,
        adapter: adapterName,
        statusCode: 409,
        expose: true,
      },
    );

    this.name = "AdapterAlreadyRegisteredError";
  }
}

/**
 * Error thrown when an adapter does not support a requested operation.
 */
export class AdapterNotSupportedError extends AdapterError {
  constructor(
    adapterName: string,
    operation: string,
  ) {
    super(
      `Adapter "${adapterName}" does not support operation "${operation}".`,
      {
        code: ErrorCode.ADAPTER_NOT_SUPPORTED,
        adapter: adapterName,
        metadata: { operation },
        statusCode: 501,
        expose: true,
      },
    );

    this.name = "AdapterNotSupportedError";
  }
}

/**
 * Error thrown when an adapter capability is missing.
 */
export class AdapterCapabilityMissingError extends AdapterError {
  constructor(
    adapterName: string,
    capability: string,
  ) {
    super(
      `Adapter "${adapterName}" is missing required capability "${capability}".`,
      {
        code: ErrorCode.ADAPTER_CAPABILITY_MISSING,
        adapter: adapterName,
        metadata: { capability },
        statusCode: 500,
        expose: false,
      },
    );

    this.name = "AdapterCapabilityMissingError";
  }
}

/**
 * Error thrown when an adapter fails to connect.
 */
export class AdapterConnectionError extends AdapterError {
  constructor(
    adapterName: string,
    cause?: unknown,
  ) {
    super(
      `Adapter "${adapterName}" failed to connect.`,
      {
        code: ErrorCode.ADAPTER_CONNECTION_FAILED,
        adapter: adapterName,
        cause,
        statusCode: 500,
        expose: false,
        isOperational: false,
      },
    );

    this.name = "AdapterConnectionError";
  }
}

/**
 * Error thrown when an adapter operation fails.
 */
export class AdapterOperationError extends AdapterError {
  constructor(
    adapterName: string,
    operation: string,
    cause?: unknown,
  ) {
    super(
      `Adapter "${adapterName}" operation "${operation}" failed.`,
      {
        code: ErrorCode.ADAPTER_OPERATION_FAILED,
        adapter: adapterName,
        cause,
        metadata: { operation },
        statusCode: 500,
        expose: false,
        isOperational: false,
      },
    );

    this.name = "AdapterOperationError";
  }
}

/**
 * Error thrown when an adapter operation times out.
 */
export class AdapterTimeoutError extends AdapterError {
  public readonly timeout: number;

  constructor(
    adapterName: string,
    operation: string,
    timeout: number,
    cause?: unknown,
  ) {
    super(
      `Adapter "${adapterName}" operation "${operation}" timed out after ${timeout}ms.`,
      {
        code: ErrorCode.ADAPTER_TIMEOUT,
        adapter: adapterName,
        cause,
        metadata: { operation, timeout },
        statusCode: 500,
        expose: false,
        isOperational: false,
      },
    );

    this.name = "AdapterTimeoutError";
    this.timeout = timeout;
  }
}

/**
 * Error thrown when an adapter fails to dispose.
 */
export class AdapterDisposeError extends AdapterError {
  constructor(
    adapterName: string,
    cause?: unknown,
  ) {
    super(
      `Adapter "${adapterName}" failed to dispose.`,
      {
        code: ErrorCode.ADAPTER_DISPOSE_FAILED,
        adapter: adapterName,
        cause,
        statusCode: 500,
        expose: false,
        isOperational: false,
      },
    );

    this.name = "AdapterDisposeError";
  }
}

/**
 * Error thrown when an adapter fails to initialize.
 */
export class AdapterInitializationError extends AdapterError {
  constructor(
    adapterName: string,
    cause?: unknown,
  ) {
    super(
      `Adapter "${adapterName}" failed to initialize.`,
      {
        code: ErrorCode.ADAPTER_INITIALIZATION_FAILED,
        adapter: adapterName,
        cause,
        statusCode: 500,
        expose: false,
        isOperational: false,
      },
    );

    this.name = "AdapterInitializationError";
  }
}

/**
 * Error thrown when an adapter fails to configure.
 */
export class AdapterConfigurationError extends AdapterError {
  constructor(
    adapterName: string,
    cause?: unknown,
  ) {
    super(
      `Adapter "${adapterName}" configuration failed.`,
      {
        code: ErrorCode.ADAPTER_CONFIGURATION_FAILED,
        adapter: adapterName,
        cause,
        statusCode: 500,
        expose: false,
        isOperational: false,
      },
    );

    this.name = "AdapterConfigurationError";
  }
}
