/**
 * Error handler types and interfaces.
 */

import { BaseError } from "../base/core/baseError.core.js";
import { ErrorCategory } from "../base/types/errorCategory.type.js";
import { ErrorSeverity } from "../base/types/errorSeverity.type.js";

/** Context supplied when handling an error. */
export interface ErrorHandlerContext {
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly userId?: string;
  readonly service?: string;
  readonly operation?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Normalized representation of an unknown error. */
export interface NormalizedError {
  readonly error: BaseError;
  readonly original: unknown;
}

/** Structured result returned by the error handler. */
export interface ErrorHandlerResult {
  readonly code: string;
  readonly message: string;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly statusCode: number;
  readonly isOperational: boolean;
  readonly expose: boolean;
  readonly requestId?: string;
  readonly correlationId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Callback used to report errors to an external logger or monitoring system. */
export type ErrorReporter = (
  error: BaseError,
  context?: ErrorHandlerContext,
) => void | Promise<void>;

/** Options for constructing an ErrorHandler. */
export interface ErrorHandlerOptions {
  readonly reporter?: ErrorReporter;
  readonly defaultStatusCode?: number;
  readonly defaultMessage?: string;
  readonly includeStack?: boolean;
}
