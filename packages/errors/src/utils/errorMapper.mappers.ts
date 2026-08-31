/**
 * Error mapping functions — native error mapping, registry-based mapping, rule creation.
 */

import { BaseError } from "../base/core/baseError.core.js";
import { ErrorCategory } from "../base/types/errorCategory.type.js";
import { ErrorCode } from "../base/types/errorCode.type.js";
import { ErrorSeverity } from "../base/types/errorSeverity.type.js";
import type { ErrorMapperContext, ErrorMapper, ErrorMapperPredicate, ErrorMappingRule } from "./errorMapper.types.js";
import type { ErrorMapperRegistry } from "./errorMapper.registry.js";

/** Maps common native JavaScript errors. */
export function mapNativeError(error: unknown): BaseError | undefined {
  if (error instanceof BaseError) {
    return error;
  }
  if (error instanceof TypeError) {
    return new BaseError(error.message, {
      code: ErrorCode.INVALID_INPUT,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.WARNING,
      statusCode: 400,
      expose: true,
      isOperational: true,
      cause: error,
    });
  }
  if (error instanceof RangeError) {
    return new BaseError(error.message, {
      code: ErrorCode.INVALID_INPUT,
      category: ErrorCategory.VALIDATION,
      severity: ErrorSeverity.WARNING,
      statusCode: 400,
      expose: true,
      isOperational: true,
      cause: error,
    });
  }
  if (error instanceof Error) {
    return new BaseError(error.message || "An unexpected error occurred.", {
      code: ErrorCode.INTERNAL_ERROR,
      category: ErrorCategory.SYSTEM,
      severity: ErrorSeverity.ERROR,
      statusCode: 500,
      expose: false,
      isOperational: false,
      cause: error,
    });
  }
  return undefined;
}

/** Maps an error using a registry and falls back to native error mapping. */
export function mapError(
  error: unknown,
  registry?: ErrorMapperRegistry,
  context?: ErrorMapperContext,
): BaseError {
  if (error instanceof BaseError) {
    return error;
  }
  const mapped = registry?.map(error, context);
  if (mapped) {
    return mapped;
  }
  const native = mapNativeError(error);
  if (native) {
    return native;
  }
  return new BaseError("An unexpected error occurred.", {
    code: ErrorCode.INTERNAL_ERROR,
    category: ErrorCategory.SYSTEM,
    severity: ErrorSeverity.ERROR,
    statusCode: 500,
    expose: false,
    isOperational: false,
    metadata: { originalType: typeof error },
  });
}

/** Creates a mapping rule for a specific error constructor. */
export function mapErrorType<T extends Error>(
  name: string,
  errorType: new (...args: unknown[]) => T,
  mapper: (error: T, context?: ErrorMapperContext) => BaseError,
  priority = 0,
): ErrorMappingRule {
  return {
    name,
    priority,
    predicate: (error) => error instanceof errorType,
    mapper: (error, context) => mapper(error as T, context),
  };
}

/** Creates a mapping rule based on a predicate. */
export function createErrorMappingRule(
  name: string,
  predicate: ErrorMapperPredicate,
  mapper: ErrorMapper,
  priority = 0,
): ErrorMappingRule {
  return { name, predicate, mapper, priority };
}
