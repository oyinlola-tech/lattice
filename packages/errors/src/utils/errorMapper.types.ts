/**
 * Error mapper types and interfaces.
 */

import { BaseError } from "../base/core/baseError.core.js";
import { ErrorCategory } from "../base/types/errorCategory.type.js";
import { ErrorSeverity } from "../base/types/errorSeverity.type.js";

/** Context supplied to an error mapper. */
export interface ErrorMapperContext {
  readonly service?: string;
  readonly operation?: string;
  readonly requestId?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Result produced by an error mapper. */
export interface ErrorMapping {
  readonly code: string;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly statusCode: number;
  readonly expose: boolean;
  readonly isOperational: boolean;
  readonly message?: string;
  readonly metadata?: Readonly<Record<string, unknown>>;
}

/** Predicate used to determine whether a mapper applies to an error. */
export type ErrorMapperPredicate = (
  error: unknown,
  context?: ErrorMapperContext,
) => boolean;

/** Function that maps an unknown error into the application's standardized error representation. */
export type ErrorMapper = (
  error: unknown,
  context?: ErrorMapperContext,
) => BaseError;

/** A registered error mapping rule. */
export interface ErrorMappingRule {
  readonly name: string;
  readonly predicate: ErrorMapperPredicate;
  readonly mapper: ErrorMapper;
  readonly priority?: number;
}
