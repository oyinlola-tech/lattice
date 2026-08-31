/**
 * Base ContainerError class and options.
 */

import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/** Options for creating a container error. */
export interface ContainerErrorOptions extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly token?: string;
}

/** Base error for all container subsystem failures. */
export class ContainerError extends BaseError {
  public readonly token?: string;

  constructor(message: string, options: ContainerErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.CONTAINER_LIFECYCLE,
      category: options.category ?? ErrorCategory.CONTAINER,
      severity: options.severity ?? ErrorSeverity.ERROR,
      statusCode: options.statusCode ?? 500,
      expose: options.expose ?? false,
      isOperational: options.isOperational ?? true,
    });
    this.token = options.token;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      ...(this.token !== undefined ? { token: this.token } : {}),
    };
  }
}

/** Creates a container error. */
export function createContainerError(message: string, options: ContainerErrorOptions = {}): ContainerError {
  return new ContainerError(message, options);
}

/** Determines whether an unknown value is a ContainerError. */
export function isContainerError(value: unknown): value is ContainerError {
  return value instanceof ContainerError;
}
