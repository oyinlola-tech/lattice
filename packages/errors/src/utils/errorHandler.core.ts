/**
 * Centralized error normalization, serialization, and reporting service.
 */

import { BaseError } from "../base/core/baseError.core.js";
import { ErrorCategory } from "../base/types/errorCategory.type.js";
import { ErrorCode } from "../base/types/errorCode.type.js";
import { ErrorSeverity } from "../base/types/errorSeverity.type.js";
import type { ErrorHandlerOptions, ErrorHandlerResult, ErrorHandlerContext, ErrorReporter, NormalizedError } from "./errorHandler.types.js";

export type { ErrorHandlerOptions, ErrorHandlerResult, ErrorHandlerContext, ErrorReporter, NormalizedError } from "./errorHandler.types.js";
export { createErrorHandler, normalizeError, isHandledError } from "./errorHandler.factory.js";

/** Centralized error normalization, serialization, and reporting service. */
export class ErrorHandler {
  private readonly reporter?: ErrorReporter;
  private readonly defaultStatusCode: number;
  private readonly defaultMessage: string;
  private readonly includeStack: boolean;

  constructor(options: ErrorHandlerOptions = {}) {
    this.reporter = options.reporter;
    this.defaultStatusCode = options.defaultStatusCode ?? 500;
    this.defaultMessage = options.defaultMessage ?? "An unexpected error occurred.";
    this.includeStack = options.includeStack ?? false;
  }

  /** Converts an unknown thrown value into a BaseError. */
  public normalize(value: unknown): NormalizedError {
    if (value instanceof BaseError) {
      return { error: value, original: value };
    }
    if (value instanceof Error) {
      const error = new BaseError(value.message || this.defaultMessage, {
        code: ErrorCode.INTERNAL_ERROR,
        category: ErrorCategory.SYSTEM,
        severity: ErrorSeverity.ERROR,
        statusCode: this.defaultStatusCode,
        expose: false,
        isOperational: false,
        cause: value,
      });
      return { error, original: value };
    }
    const message = typeof value === "string" ? value : this.defaultMessage;
    const error = new BaseError(message, {
      code: ErrorCode.INTERNAL_ERROR,
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.ERROR,
      statusCode: this.defaultStatusCode,
      expose: false,
      isOperational: false,
      metadata: { originalType: typeof value },
    });
    return { error, original: value };
  }

  /** Handles and normalizes an unknown error. */
  public async handle(
    value: unknown,
    context?: ErrorHandlerContext,
  ): Promise<ErrorHandlerResult> {
    const { error } = this.normalize(value);
    if (this.reporter) {
      await this.reporter(error, context);
    }
    return this.toResult(error, context);
  }

  /** Converts a BaseError into a safe response object. */
  public toResult(error: BaseError, context?: ErrorHandlerContext): ErrorHandlerResult {
    const metadata = {
      ...(error.toJSON().metadata ?? {}),
      ...(context?.metadata ?? {}),
    };
    return {
      code: error.code,
      message: error.expose ? error.message : this.defaultMessage,
      category: error.category,
      severity: error.severity,
      statusCode: error.statusCode,
      isOperational: error.isOperational,
      expose: error.expose,
      ...(context?.requestId ? { requestId: context.requestId } : {}),
      ...(context?.correlationId ? { correlationId: context.correlationId } : {}),
      ...(Object.keys(metadata).length > 0
        ? { metadata: this.sanitizeMetadata(metadata) }
        : {}),
    };
  }

  /** Reports an error without producing a response. */
  public async report(value: unknown, context?: ErrorHandlerContext): Promise<BaseError> {
    const { error } = this.normalize(value);
    if (this.reporter) {
      await this.reporter(error, context);
    }
    return error;
  }

  /** Determines whether an error should expose its message to clients. */
  public shouldExpose(error: BaseError): boolean {
    return error.expose;
  }

  /** Returns a safe serialized error representation. */
  public serialize(error: BaseError, context?: ErrorHandlerContext): Record<string, unknown> {
    const result = this.toResult(error, context);
    if (this.includeStack && error.expose === false) {
      return { ...result, stack: error.stack } as Record<string, unknown>;
    }
    return result as unknown as Record<string, unknown>;
  }

  /** Removes obviously sensitive fields from metadata before serialization. */
  private sanitizeMetadata(metadata: Readonly<Record<string, unknown>>): Record<string, unknown> {
    const sensitiveKeys = new Set([
      "password", "passcode", "token", "accessToken", "refreshToken",
      "authorization", "cookie", "secret", "privateKey", "apiKey", "credential",
    ]);
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(metadata)) {
      sanitized[key] = sensitiveKeys.has(key) ? "[REDACTED]" : value;
    }
    return sanitized;
  }
}
