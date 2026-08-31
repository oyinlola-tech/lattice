/**
 * RPC transport error classes — timeout, cancelled, availability.
 */

import { ErrorCode } from "../../base/types/errorCode.type.js";
import { RPCError } from "./rpcError.base.js";

/** Error thrown when an RPC operation times out. */
export class RPCTimeoutError extends RPCError {
  public readonly timeout: number;

  constructor(timeout: number, procedureName?: string) {
    super(
      `RPC operation timed out after ${timeout}ms.`,
      { code: ErrorCode.RPC_TIMEOUT, procedureName, metadata: { timeout }, statusCode: 504, expose: false },
    );
    this.name = "RPCTimeoutError";
    this.timeout = timeout;
  }
}

/** Error thrown when an RPC operation is cancelled. */
export class RPCCancelledError extends RPCError {
  constructor(message = "RPC operation was cancelled.", procedureName?: string) {
    super(message, {
      code: ErrorCode.RPC_CANCELLED,
      procedureName,
      statusCode: 499,
      expose: false,
    });
    this.name = "RPCCancelledError";
  }
}

/** Error thrown when an RPC transport error occurs. */
export class RPCTransportError extends RPCError {
  constructor(message: string, procedureName?: string) {
    super(message, {
      code: ErrorCode.RPC_TRANSPORT_ERROR,
      procedureName,
      statusCode: 502,
      expose: false,
    });
    this.name = "RPCTransportError";
  }
}

/** Error thrown when an RPC service is unavailable. */
export class RPCUnavailableError extends RPCError {
  constructor(message = "RPC service is temporarily unavailable.", procedureName?: string) {
    super(message, {
      code: ErrorCode.RPC_UNAVAILABLE,
      procedureName,
      statusCode: 503,
      expose: true,
    });
    this.name = "RPCUnavailableError";
  }
}

/** Error thrown when an RPC rate limit is exceeded. */
export class RPCRateLimitedError extends RPCError {
  public readonly retryAfter?: number;

  constructor(
    message = "RPC rate limit exceeded.",
    retryAfter?: number,
    procedureName?: string,
  ) {
    super(message, {
      code: ErrorCode.RPC_RATE_LIMITED,
      procedureName,
      metadata: { retryAfter },
      statusCode: 429,
      expose: true,
    });
    this.name = "RPCRateLimitedError";
    this.retryAfter = retryAfter;
  }
}

/** Error thrown when an RPC deadline is exceeded. */
export class RPCDeadlineExceededError extends RPCError {
  constructor(deadline: number, procedureName?: string) {
    super(
      `RPC deadline exceeded at ${deadline}.`,
      { code: ErrorCode.RPC_DEADLINE_EXCEEDED, procedureName, metadata: { deadline }, statusCode: 504, expose: false },
    );
    this.name = "RPCDeadlineExceededError";
  }
}
