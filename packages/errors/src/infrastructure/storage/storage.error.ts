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
 * Storage operation types used for diagnostics.
 */
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

/**
 * Options for creating a storage error.
 */
export interface StorageErrorOptions
  extends Omit<
    BaseErrorOptions,
    "category"
  > {
  readonly category?: ErrorCategory;

  /**
   * Storage operation that failed.
   */
  readonly operation?: StorageOperation;

  /**
   * Storage provider, bucket, or backend name.
   */
  readonly provider?: string;

  /**
   * Resource key or path involved in the operation.
   *
   * Avoid including credentials, signed URLs, or other secrets.
   */
  readonly resource?: string;
}

/**
 * Error raised when a storage operation fails.
 */
export class StorageError
  extends BaseError {
  public readonly operation: StorageOperation;

  public readonly provider?: string;

  public readonly resource?: string;

  constructor(
    message =
      "A storage operation failed.",
    options: StorageErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.STORAGE,
        category:
          options.category ??
          ErrorCategory.STORAGE,
        severity:
          options.severity ??
          ErrorSeverity.ERROR,
        statusCode:
          options.statusCode ??
          500,
        expose:
          options.expose ??
          false,
        isOperational:
          options.isOperational ??
          true,
        metadata: {
          ...options.metadata,
          ...(options.operation !==
          undefined
            ? {
                operation:
                  options.operation,
              }
            : {}),
          ...(options.provider !==
          undefined
            ? {
                provider:
                  options.provider,
              }
            : {}),
          ...(options.resource !==
          undefined
            ? {
                resource:
                  options.resource,
              }
            : {}),
        },
      },
    );

    this.operation =
      options.operation ??
      StorageOperation.UNKNOWN;

    this.provider =
      options.provider;

    this.resource =
      options.resource;
  }

  /**
   * Returns a serialized representation with storage diagnostics.
   */
  public override toJSON() {
    return {
      ...super.toJSON(),
      operation:
        this.operation,
      ...(this.provider !==
      undefined
        ? {
            provider:
              this.provider,
          }
        : {}),
      ...(this.resource !==
      undefined
        ? {
            resource:
              this.resource,
          }
        : {}),
    };
  }
}

/**
 * Creates a storage error.
 */
export function createStorageError(
  message =
    "A storage operation failed.",
  options: StorageErrorOptions = {},
): StorageError {
  return new StorageError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is a StorageError.
 */
export function isStorageError(
  value: unknown,
): value is StorageError {
  return (
    value instanceof StorageError
  );
}

/**
 * Creates a storage read error.
 */
export function storageReadError(
  message =
    "Failed to read from storage.",
  options: Omit<
    StorageErrorOptions,
    "operation"
  > = {},
): StorageError {
  return new StorageError(
    message,
    {
      ...options,
      code:
        ErrorCode.STORAGE_READ,
      operation:
        StorageOperation.READ,
    },
  );
}

/**
 * Creates a storage write error.
 */
export function storageWriteError(
  message =
    "Failed to write to storage.",
  options: Omit<
    StorageErrorOptions,
    "operation"
  > = {},
): StorageError {
  return new StorageError(
    message,
    {
      ...options,
      code:
        ErrorCode.STORAGE_WRITE,
      operation:
        StorageOperation.WRITE,
    },
  );
}

/**
 * Creates a storage upload error.
 */
export function storageUploadError(
  message =
    "Failed to upload the resource.",
  options: Omit<
    StorageErrorOptions,
    "operation"
  > = {},
): StorageError {
  return new StorageError(
    message,
    {
      ...options,
      code:
        ErrorCode.STORAGE_UPLOAD,
      operation:
        StorageOperation.UPLOAD,
    },
  );
}

/**
 * Creates a storage download error.
 */
export function storageDownloadError(
  message =
    "Failed to download the resource.",
  options: Omit<
    StorageErrorOptions,
    "operation"
  > = {},
): StorageError {
  return new StorageError(
    message,
    {
      ...options,
      code:
        ErrorCode.STORAGE_DOWNLOAD,
      operation:
        StorageOperation.DOWNLOAD,
    },
  );
}

/**
 * Creates a storage deletion error.
 */
export function storageDeleteError(
  message =
    "Failed to delete the resource.",
  options: Omit<
    StorageErrorOptions,
    "operation"
  > = {},
): StorageError {
  return new StorageError(
    message,
    {
      ...options,
      code:
        ErrorCode.STORAGE_DELETE,
      operation:
        StorageOperation.DELETE,
    },
  );
}

/**
 * Creates a storage not-found error.
 */
export function storageNotFoundError(
  resource?: string,
): StorageError {
  return new StorageError(
    resource
      ? `Storage resource "${resource}" was not found.`
      : "The storage resource was not found.",
    {
      code:
        ErrorCode.STORAGE_NOT_FOUND,
      operation:
        StorageOperation.READ,
      statusCode:
        404,
      expose:
        true,
      resource,
    },
  );
}