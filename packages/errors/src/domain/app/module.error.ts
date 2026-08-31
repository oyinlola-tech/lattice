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
 * Options for creating a module error.
 */
export interface ModuleErrorOptions
  extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly moduleId?: string;
  readonly dependencyId?: string;
}

/**
 * Base error for all module subsystem failures.
 */
export class ModuleError extends BaseError {
  public readonly moduleId?: string;
  public readonly dependencyId?: string;

  constructor(
    message: string,
    options: ModuleErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.OPERATION_FAILED,
        category:
          options.category ??
          ErrorCategory.MODULE,
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

    this.moduleId = options.moduleId;
    this.dependencyId =
      options.dependencyId;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.moduleId !== undefined
        ? { moduleId: this.moduleId }
        : {}),
      ...(this.dependencyId !== undefined
        ? { dependencyId: this.dependencyId }
        : {}),
    };
  }
}

/**
 * Creates a module error.
 */
export function createModuleError(
  message: string,
  options: ModuleErrorOptions = {},
): ModuleError {
  return new ModuleError(message, options);
}

/**
 * Determines whether an unknown value is a ModuleError.
 */
export function isModuleError(
  value: unknown,
): value is ModuleError {
  return value instanceof ModuleError;
}

/**
 * Error thrown when a module is not found.
 */
export class ModuleNotFoundError extends ModuleError {
  constructor(
    moduleId: string,
    message?: string,
  ) {
    super(
      message ??
        `Module "${moduleId}" was not found.`,
      {
        code:
          ErrorCode.MODULE_NOT_FOUND,
        statusCode: 404,
        expose: true,
        moduleId,
      },
    );
  }
}

/**
 * Error thrown when a module fails to load.
 */
export class ModuleLoadError extends ModuleError {
  constructor(
    moduleId: string,
    message?: string,
    cause?: unknown,
  ) {
    super(
      message ??
        `Failed to load module "${moduleId}".`,
      {
        code:
          ErrorCode.MODULE_LOAD_FAILED,
        cause,
        moduleId,
        isOperational: false,
      },
    );
  }
}

/**
 * Error thrown when a module lifecycle operation fails.
 */
export class ModuleLifecycleError
  extends ModuleError {
  public readonly phase: string;

  constructor(
    moduleId: string,
    phase: string,
    message?: string,
    cause?: unknown,
  ) {
    super(
      message ??
        `Module "${moduleId}" failed during ${phase}.`,
      {
        code:
          ErrorCode.MODULE_LIFECYCLE,
        cause,
        moduleId,
        metadata: { phase },
        isOperational: false,
      },
    );

    this.phase = phase;
  }
}

/**
 * Error thrown when a module dependency is missing.
 */
export class ModuleDependencyError
  extends ModuleError {
  constructor(
    moduleId: string,
    dependencyId: string,
    message?: string,
  ) {
    super(
      message ??
        `Module "${moduleId}" depends on "${dependencyId}" which is not available.`,
      {
        code:
          ErrorCode.MODULE_DEPENDENCY_MISSING,
        moduleId,
        dependencyId,
        statusCode: 500,
        expose: false,
      },
    );
  }
}
