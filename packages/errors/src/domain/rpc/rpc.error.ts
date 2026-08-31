import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";

import type { ErrorMetadataValue } from "../../base/core/errorMetadata.core.js";

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
 * Options for creating an RPC error.
 */
export interface RPCErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly procedureName?: string;
}

/**
 * Base error for all RPC failures.
 */
export class RPCError extends BaseError {
  public readonly procedureName?: string;

  constructor(
    message: string,
    options: RPCErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code: options.code ?? ErrorCode.RPC_ERROR,
        category: options.category ?? ErrorCategory.RPC,
        severity: options.severity ?? ErrorSeverity.ERROR,
        statusCode: options.statusCode ?? 500,
        expose: options.expose ?? false,
        isOperational: options.isOperational ?? true,
      },
    );

    this.procedureName = options.procedureName;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.procedureName !== undefined
        ? { procedureName: this.procedureName }
        : {}),
    };
  }
}

/**
 * Creates an RPC error.
 */
export function createRPCError(
  message: string,
  options: RPCErrorOptions = {},
): RPCError {
  return new RPCError(message, options);
}

/**
 * Determines whether an unknown value is an RPCError.
 */
export function isRPCError(
  value: unknown,
): value is RPCError {
  return value instanceof RPCError;
}

/**
 * Error thrown when an RPC procedure is not found.
 */
export class RPCProcedureNotFoundError extends RPCError {
  constructor(
    procedureName: string,
  ) {
    super(
      `RPC procedure "${procedureName}" is not registered.`,
      {
        code: ErrorCode.RPC_PROCEDURE_NOT_FOUND,
        procedureName,
        statusCode: 404,
        expose: true,
      },
    );

    this.name = "RPCProcedureNotFoundError";
  }
}

/**
 * Error thrown when an RPC request is invalid.
 */
export class RPCInvalidRequestError extends RPCError {
  constructor(
    message = "Invalid RPC request.",
    procedureName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.RPC_INVALID_REQUEST,
        procedureName,
        statusCode: 400,
        expose: true,
      },
    );

    this.name = "RPCInvalidRequestError";
  }
}

/**
 * Error thrown when RPC input validation fails.
 */
export class RPCValidationError extends RPCError {
  public readonly issues: readonly ErrorMetadataValue[];

  constructor(
    message: string,
    issues: readonly ErrorMetadataValue[] = [],
    procedureName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.RPC_VALIDATION_ERROR,
        procedureName,
        metadata: { issues },
        statusCode: 422,
        expose: true,
      },
    );

    this.name = "RPCValidationError";
    this.issues = Object.freeze([...issues]);
  }
}

/**
 * Error thrown when RPC authentication fails.
 */
export class RPCAuthenticationError extends RPCError {
  constructor(
    message = "RPC authentication is required.",
    procedureName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.RPC_UNAUTHORIZED,
        procedureName,
        statusCode: 401,
        expose: true,
      },
    );

    this.name = "RPCAuthenticationError";
  }
}

/**
 * Error thrown when RPC authorization fails.
 */
export class RPCForbiddenError extends RPCError {
  constructor(
    message = "You do not have permission to call this RPC procedure.",
    procedureName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.RPC_FORBIDDEN,
        procedureName,
        statusCode: 403,
        expose: true,
      },
    );

    this.name = "RPCForbiddenError";
  }
}

/**
 * Error thrown when an RPC operation times out.
 */
export class RPCTimeoutError extends RPCError {
  public readonly timeout: number;

  constructor(
    timeout: number,
    procedureName?: string,
  ) {
    super(
      `RPC operation timed out after ${timeout}ms.`,
      {
        code: ErrorCode.RPC_TIMEOUT,
        procedureName,
        metadata: { timeout },
        statusCode: 504,
        expose: false,
      },
    );

    this.name = "RPCTimeoutError";
    this.timeout = timeout;
  }
}

/**
 * Error thrown when an RPC operation is cancelled.
 */
export class RPCCancelledError extends RPCError {
  constructor(
    message = "RPC operation was cancelled.",
    procedureName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.RPC_CANCELLED,
        procedureName,
        statusCode: 499,
        expose: false,
      },
    );

    this.name = "RPCCancelledError";
  }
}

/**
 * Error thrown when an unexpected internal RPC error occurs.
 */
export class RPCInternalError extends RPCError {
  constructor(
    message = "An unexpected internal RPC error occurred.",
    procedureName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.RPC_INTERNAL_ERROR,
        procedureName,
        statusCode: 500,
        expose: false,
        isOperational: false,
      },
    );

    this.name = "RPCInternalError";
  }
}

/**
 * Error thrown when an RPC transport error occurs.
 */
export class RPCTransportError extends RPCError {
  constructor(
    message: string,
    procedureName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.RPC_TRANSPORT_ERROR,
        procedureName,
        statusCode: 502,
        expose: false,
      },
    );

    this.name = "RPCTransportError";
  }
}

/**
 * Error thrown when RPC serialization fails.
 */
export class RPCSerializationError extends RPCError {
  constructor(
    message: string,
    procedureName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.RPC_SERIALIZATION_ERROR,
        procedureName,
        statusCode: 500,
        expose: false,
      },
    );

    this.name = "RPCSerializationError";
  }
}

/**
 * Error thrown when RPC deserialization fails.
 */
export class RPCDeserializationError extends RPCError {
  constructor(
    message: string,
    procedureName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.RPC_DESERIALIZATION_ERROR,
        procedureName,
        statusCode: 400,
        expose: true,
      },
    );

    this.name = "RPCDeserializationError";
  }
}

/**
 * Error thrown when an RPC service is unavailable.
 */
export class RPCUnavailableError extends RPCError {
  constructor(
    message = "RPC service is temporarily unavailable.",
    procedureName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.RPC_UNAVAILABLE,
        procedureName,
        statusCode: 503,
        expose: true,
      },
    );

    this.name = "RPCUnavailableError";
  }
}

/**
 * Error thrown when an RPC rate limit is exceeded.
 */
export class RPCRateLimitedError extends RPCError {
  public readonly retryAfter?: number;

  constructor(
    message = "RPC rate limit exceeded.",
    retryAfter?: number,
    procedureName?: string,
  ) {
    super(
      message,
      {
        code: ErrorCode.RPC_RATE_LIMITED,
        procedureName,
        metadata: { retryAfter },
        statusCode: 429,
        expose: true,
      },
    );

    this.name = "RPCRateLimitedError";
    this.retryAfter = retryAfter;
  }
}

/**
 * Error thrown when an RPC deadline is exceeded.
 */
export class RPCDeadlineExceededError extends RPCError {
  constructor(
    deadline: number,
    procedureName?: string,
  ) {
    super(
      `RPC deadline exceeded at ${deadline}.`,
      {
        code: ErrorCode.RPC_DEADLINE_EXCEEDED,
        procedureName,
        metadata: { deadline },
        statusCode: 504,
        expose: false,
      },
    );

    this.name = "RPCDeadlineExceededError";
  }
}

/**
 * Error thrown when a duplicate RPC procedure is registered.
 */
export class RPCDuplicateProcedureError extends RPCError {
  constructor(
    procedureName: string,
  ) {
    super(
      `RPC procedure "${procedureName}" is already registered.`,
      {
        code: ErrorCode.RPC_DUPLICATE_PROCEDURE,
        procedureName,
        statusCode: 409,
        expose: true,
      },
    );

    this.name = "RPCDuplicateProcedureError";
  }
}
