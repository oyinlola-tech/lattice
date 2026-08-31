import type { ErrorCategory } from "./errorCategory.type.js";
import type { ErrorCode } from "./errorCode.type.js";
import type { ErrorSeverity } from "./errorSeverity.type.js";
import type { ErrorMetadata } from "../core/errorMetadata.type.js";

/**
 * Options used to construct a Lattice application error.
 */
export interface BaseErrorOptions {
  readonly code?: ErrorCode | string;
  readonly category?: ErrorCategory;
  readonly severity?: ErrorSeverity;
  readonly message?: string;
  readonly metadata?: ErrorMetadata;
  readonly cause?: unknown;
  readonly statusCode?: number;
  readonly expose?: boolean;
  readonly isOperational?: boolean;
}

/**
 * Serializable representation of a BaseError.
 */
export interface SerializedBaseError {
  readonly name: string;
  readonly message: string;
  readonly code: string;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly statusCode: number;
  readonly expose: boolean;
  readonly isOperational: boolean;
  readonly metadata: Readonly<ErrorMetadata>;
  readonly stack?: string;
  readonly cause?: SerializedBaseError | unknown;
}
