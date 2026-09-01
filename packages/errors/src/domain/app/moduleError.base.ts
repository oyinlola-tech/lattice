import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/**
 * Options for creating a module error.
 */
export interface ModuleErrorOptions extends Omit<BaseErrorOptions, "category"> {
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

  constructor(message: string, options: ModuleErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.OPERATION_FAILED,
      category: options.category ?? ErrorCategory.MODULE,
      severity: options.severity ?? ErrorSeverity.ERROR,
      statusCode: options.statusCode ?? 500,
      expose: options.expose ?? false,
      isOperational: options.isOperational ?? true,
    });

    this.moduleId = options.moduleId;
    this.dependencyId = options.dependencyId;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.moduleId !== undefined ? { moduleId: this.moduleId } : {}),
      ...(this.dependencyId !== undefined
        ? { dependencyId: this.dependencyId }
        : {}),
    };
  }
}

/** Creates a module error. */
export function createModuleError(
  message: string,
  options: ModuleErrorOptions = {},
): ModuleError {
  return new ModuleError(message, options);
}

/** Determines whether an unknown value is a ModuleError. */
export function isModuleError(value: unknown): value is ModuleError {
  return value instanceof ModuleError;
}
