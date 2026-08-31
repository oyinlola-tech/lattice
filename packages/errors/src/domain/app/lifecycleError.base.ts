/**
 * Base LifecycleError class, options, and factory functions.
 */

import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/** Options for creating a lifecycle error. */
export interface LifecycleErrorOptions extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly componentId?: string;
  readonly phase?: string;
}

/** Base error for all lifecycle failures. */
export class LifecycleError extends BaseError {
  public readonly componentId?: string;
  public readonly phase?: string;

  constructor(message: string, options: LifecycleErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.LIFECYCLE_COMPONENT,
      category: options.category ?? ErrorCategory.SYSTEM,
      severity: options.severity ?? ErrorSeverity.ERROR,
      statusCode: options.statusCode ?? 500,
      expose: options.expose ?? false,
      isOperational: options.isOperational ?? true,
    });
    this.componentId = options.componentId;
    this.phase = options.phase;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.componentId !== undefined ? { componentId: this.componentId } : {}),
      ...(this.phase !== undefined ? { phase: this.phase } : {}),
    };
  }
}

/** Creates a lifecycle error. */
export function createLifecycleError(message: string, options: LifecycleErrorOptions = {}): LifecycleError {
  return new LifecycleError(message, options);
}

/** Determines whether an unknown value is a LifecycleError. */
export function isLifecycleError(value: unknown): value is LifecycleError {
  return value instanceof LifecycleError;
}
