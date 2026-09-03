/**
 * Specific transaction error subclasses.
 */

import { ErrorCode } from "@zudo/errors";
import { TransactionError } from "./transactionError.base.js";

/**
 * Transaction is in an invalid state for the requested operation.
 */
export class TransactionStateError extends TransactionError {
  constructor(state: string, operation: string) {
    super(`Cannot ${operation} transaction in state "${state}"`, {
      code: ErrorCode.LIFECYCLE_STATE,
      metadata: { state, operation },
    });
  }
}

/**
 * Transaction exceeded its timeout.
 */
export class TransactionTimeoutError extends TransactionError {
  constructor(transactionId: string, timeoutMs: number) {
    super(`Transaction "${transactionId}" timed out after ${timeoutMs}ms`, {
      code: ErrorCode.TIMEOUT,
      metadata: { transactionId, timeoutMs },
    });
  }
}

/**
 * Transaction commit failed.
 */
export class TransactionCommitError extends TransactionError {
  constructor(transactionId: string, cause?: unknown) {
    super(`Transaction "${transactionId}" commit failed`, {
      code: ErrorCode.DATABASE_TRANSACTION,
      cause,
      metadata: { transactionId },
    });
  }
}

/**
 * Transaction rollback failed.
 */
export class TransactionRollbackError extends TransactionError {
  constructor(
    transactionId: string,
    options?: {
      readonly cause?: unknown;
      readonly originalError?: unknown;
    },
  ) {
    super(`Transaction "${transactionId}" rollback failed`, {
      code: ErrorCode.DATABASE_TRANSACTION,
      cause: options?.cause,
      metadata: {
        transactionId,
        originalError:
          options?.originalError instanceof Error
            ? options.originalError.message
            : String(options?.originalError ?? "unknown"),
      },
    });
  }
}

/**
 * The underlying adapter threw an error.
 */
export class TransactionAdapterError extends TransactionError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      code: ErrorCode.ADAPTER_OPERATION_FAILED,
      cause,
    });
  }
}

/**
 * Propagation strategy violation.
 */
export class TransactionPropagationError extends TransactionError {
  constructor(message: string) {
    super(message, { code: ErrorCode.VALIDATION_FAILED });
  }
}

/**
 * Required isolation level is not supported by the adapter.
 */
export class TransactionIsolationError extends TransactionError {
  constructor(level: string) {
    super(`Isolation level "${level}" is not supported by the adapter`, {
      code: ErrorCode.VALIDATION_FAILED,
      metadata: { level },
    });
  }
}

/**
 * Savepoint operation failed.
 */
export class SavepointError extends TransactionError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      code: ErrorCode.OPERATION_FAILED,
      cause,
    });
  }
}

/**
 * A transaction is required but none exists.
 */
export class TransactionRequiredError extends TransactionError {
  constructor() {
    super("A transaction is required but none exists", {
      code: ErrorCode.PRECONDITION_FAILED,
    });
  }
}

/**
 * A transaction exists but none was expected.
 */
export class TransactionUnexpectedError extends TransactionError {
  constructor() {
    super("A transaction already exists but none was expected", {
      code: ErrorCode.CONFLICT,
    });
  }
}

/**
 * The adapter does not support the requested capability.
 */
export class TransactionCapabilityError extends TransactionError {
  constructor(capability: string) {
    super(`Adapter does not support: ${capability}`, {
      code: ErrorCode.NOT_IMPLEMENTED,
      metadata: { capability },
    });
  }
}
