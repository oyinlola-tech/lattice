import { BaseError } from "../base/core/baseError.core.js";

import {
  ErrorCategory,
} from "../base/types/errorCategory.type.js";

import {
  ErrorCode,
} from "../base/types/errorCode.type.js";

import {
  ErrorSeverity,
} from "../base/types/errorSeverity.type.js";

/**
 * Context supplied to an error mapper.
 */
export interface ErrorMapperContext {
  readonly service?: string;
  readonly operation?: string;
  readonly requestId?: string;
  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

/**
 * Result produced by an error mapper.
 */
export interface ErrorMapping {
  readonly code: string;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly statusCode: number;
  readonly expose: boolean;
  readonly isOperational: boolean;
  readonly message?: string;
  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

/**
 * Predicate used to determine whether a mapper applies to an error.
 */
export type ErrorMapperPredicate = (
  error: unknown,
  context?: ErrorMapperContext,
) => boolean;

/**
 * Function that maps an unknown error into the application's
 * standardized error representation.
 */
export type ErrorMapper = (
  error: unknown,
  context?: ErrorMapperContext,
) => BaseError;

/**
 * A registered error mapping rule.
 */
export interface ErrorMappingRule {
  readonly name: string;
  readonly predicate: ErrorMapperPredicate;
  readonly mapper: ErrorMapper;
  readonly priority?: number;
}

/**
 * Central registry for converting third-party and native errors
 * into application errors.
 */
export class ErrorMapperRegistry {
  private readonly rules: ErrorMappingRule[] = [];

  /**
   * Registers a mapping rule.
   */
  public register(
    rule: ErrorMappingRule,
  ): this {
    if (
      !rule.name.trim()
    ) {
      throw new TypeError(
        "Error mapping rule name cannot be empty.",
      );
    }

    if (
      this.rules.some(
        (existing) =>
          existing.name ===
          rule.name,
      )
    ) {
      throw new Error(
        `An error mapping rule named "${rule.name}" is already registered.`,
      );
    }

    this.rules.push(rule);

    this.rules.sort(
      (
        first,
        second,
      ) =>
        (second.priority ?? 0) -
        (first.priority ?? 0),
    );

    return this;
  }

  /**
   * Removes a mapping rule by name.
   */
  public unregister(
    name: string,
  ): boolean {
    const index =
      this.rules.findIndex(
        (rule) =>
          rule.name === name,
      );

    if (index === -1) {
      return false;
    }

    this.rules.splice(
      index,
      1,
    );

    return true;
  }

  /**
   * Returns whether a rule with the specified name exists.
   */
  public has(
    name: string,
  ): boolean {
    return this.rules.some(
      (rule) =>
        rule.name === name,
    );
  }

  /**
   * Finds the first rule that matches an error.
   */
  public find(
    error: unknown,
    context?: ErrorMapperContext,
  ): ErrorMappingRule | undefined {
    return this.rules.find(
      (rule) =>
        rule.predicate(
          error,
          context,
        ),
    );
  }

  /**
   * Maps an unknown error using the first matching rule.
   */
  public map(
    error: unknown,
    context?: ErrorMapperContext,
  ): BaseError | undefined {
    const rule =
      this.find(
        error,
        context,
      );

    if (!rule) {
      return undefined;
    }

    return rule.mapper(
      error,
      context,
    );
  }

  /**
   * Returns all registered rules.
   */
  public getRules(): readonly ErrorMappingRule[] {
    return [
      ...this.rules,
    ];
  }

  /**
   * Clears all registered rules.
   */
  public clear(): void {
    this.rules.length = 0;
  }
}

/**
 * Creates an error mapper registry.
 */
export function createErrorMapperRegistry(): ErrorMapperRegistry {
  return new ErrorMapperRegistry();
}

/**
 * Maps common native JavaScript errors.
 */
export function mapNativeError(
  error: unknown,
): BaseError | undefined {
  if (
    error instanceof BaseError
  ) {
    return error;
  }

  if (
    error instanceof TypeError
  ) {
    return new BaseError(
      error.message,
      {
        code:
          ErrorCode.INVALID_INPUT,
        category:
          ErrorCategory.VALIDATION,
        severity:
          ErrorSeverity.WARNING,
        statusCode:
          400,
        expose:
          true,
        isOperational:
          true,
        cause:
          error,
      },
    );
  }

  if (
    error instanceof RangeError
  ) {
    return new BaseError(
      error.message,
      {
        code:
          ErrorCode.INVALID_INPUT,
        category:
          ErrorCategory.VALIDATION,
        severity:
          ErrorSeverity.WARNING,
        statusCode:
          400,
        expose:
          true,
        isOperational:
          true,
        cause:
          error,
      },
    );
  }

  if (
    error instanceof Error
  ) {
    return new BaseError(
      error.message ||
        "An unexpected error occurred.",
      {
        code:
          ErrorCode.INTERNAL_ERROR,
        category:
          ErrorCategory.SYSTEM,
        severity:
          ErrorSeverity.ERROR,
        statusCode:
          500,
        expose:
          false,
        isOperational:
          false,
        cause:
          error,
      },
    );
  }

  return undefined;
}

/**
 * Maps an error using a registry and falls back to native error mapping.
 */
export function mapError(
  error: unknown,
  registry?: ErrorMapperRegistry,
  context?: ErrorMapperContext,
): BaseError {
  if (
    error instanceof BaseError
  ) {
    return error;
  }

  const mapped =
    registry?.map(
      error,
      context,
    );

  if (mapped) {
    return mapped;
  }

  const native =
    mapNativeError(error);

  if (native) {
    return native;
  }

  return new BaseError(
    "An unexpected error occurred.",
    {
      code:
        ErrorCode.INTERNAL_ERROR,
      category:
        ErrorCategory.SYSTEM,
      severity:
        ErrorSeverity.ERROR,
      statusCode:
        500,
      expose:
        false,
      isOperational:
        false,
      metadata: {
        originalType:
          typeof error,
      },
    },
  );
}

/**
 * Creates a mapping rule for a specific error constructor.
 */
export function mapErrorType<
  T extends Error,
>(
  name: string,
  errorType: new (
    ...args: unknown[]
  ) => T,
  mapper: (
    error: T,
    context?: ErrorMapperContext,
  ) => BaseError,
  priority = 0,
): ErrorMappingRule {
  return {
    name,
    priority,
    predicate: (
      error,
    ) =>
      error instanceof
      errorType,
    mapper: (
      error,
      context,
    ) =>
      mapper(
        error as T,
        context,
      ),
  };
}

/**
 * Creates a mapping rule based on a predicate.
 */
export function createErrorMappingRule(
  name: string,
  predicate: ErrorMapperPredicate,
  mapper: ErrorMapper,
  priority = 0,
): ErrorMappingRule {
  return {
    name,
    predicate,
    mapper,
    priority,
  };
}