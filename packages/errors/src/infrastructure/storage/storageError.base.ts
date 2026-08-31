/**
 * Base StorageError class and options.
 */

import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/** Storage operation types used for diagnostics. */
export enum StorageOperation {
  UNKNOWN = "unknown",
  READ = "read",
  WRITE = "write",
  DELETE = "delete",
  UPLOAD = "upload",
  DOWNLOAD = "download",
  MOVE = "move",
  COPY = "copy",
  LIST = "list",
  EXISTS = "exists",
}

/** Options for creating a storage error. */
export interface StorageErrorOptions extends Omit<BaseErrorOptions, "category"> {
  readonly category?: ErrorCategory;
  readonly operation?: StorageOperation;
  readonly provider?: string;
  readonly resource?: string;
}

/** Error raised when a storage operation fails. */
export class StorageError extends BaseError {
  public readonly operation: StorageOperation;
  public readonly provider?: string;
  public readonly resource?: string;

  constructor(message = "A storage operation failed.", options: StorageErrorOptions = {}) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.STORAGE,
      category: options.category ?? ErrorCategory.STORAGE,
      severity: options.severity ?? ErrorSeverity.ERROR,
      statusCode: options.statusCode ?? 500,
      expose: options.expose ?? false,
      isOperational: options.isOperational ?? true,
      metadata: {
        ...options.metadata,
        ...(options.operation !== undefined ? { operation: options.operation } : {}),
        ...(options.provider !== undefined ? { provider: options.provider } : {}),
        ...(options.resource !== undefined ? { resource: options.resource } : {}),
      },
    });
    this.operation = options.operation ?? StorageOperation.UNKNOWN;
    this.provider = options.provider;
    this.resource = options.resource;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
      ...(this.provider !== undefined ? { provider: this.provider } : {}),
      ...(this.resource !== undefined ? { resource: this.resource } : {}),
    };
  }
}

/** Creates a storage error. */
export function createStorageError(
  message = "A storage operation failed.",
  options: StorageErrorOptions = {},
): StorageError {
  return new StorageError(message, options);
}

/** Determines whether an unknown value is a StorageError. */
export function isStorageError(value: unknown): value is StorageError {
  return value instanceof StorageError;
}
