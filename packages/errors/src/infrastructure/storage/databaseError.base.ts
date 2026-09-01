/**
 * Base DatabaseError class, options, and factory functions.
 */

import { BaseError } from "../../base/core/baseError.core.js";
import type { BaseErrorOptions } from "../../base/types/baseError.type.js";
import { ErrorCategory } from "../../base/types/errorCategory.type.js";
import { ErrorCode } from "../../base/types/errorCode.type.js";
import { ErrorSeverity } from "../../base/types/errorSeverity.type.js";

/** Database operation types used for diagnostics. */
export enum DatabaseOperation {
  UNKNOWN = "unknown",
  CONNECT = "connect",
  DISCONNECT = "disconnect",
  QUERY = "query",
  INSERT = "insert",
  UPDATE = "update",
  DELETE = "delete",
  TRANSACTION = "transaction",
  MIGRATION = "migration",
}

/** Options for creating a database error. */
export interface DatabaseErrorOptions extends Omit<
  BaseErrorOptions,
  "category"
> {
  readonly category?: ErrorCategory;
  readonly operation?: DatabaseOperation;
  readonly driver?: string;
  readonly databaseCode?: string | number;
}

/** Error raised by a database or persistence operation. */
export class DatabaseError extends BaseError {
  public readonly operation: DatabaseOperation;
  public readonly driver?: string;
  public readonly databaseCode?: string | number;

  constructor(
    message = "A database operation failed.",
    options: DatabaseErrorOptions = {},
  ) {
    super(message, {
      ...options,
      code: options.code ?? ErrorCode.DATABASE,
      category: options.category ?? ErrorCategory.DATABASE,
      severity: options.severity ?? ErrorSeverity.ERROR,
      statusCode: options.statusCode ?? 500,
      expose: options.expose ?? false,
      isOperational: options.isOperational ?? true,
      metadata: {
        ...options.metadata,
        ...(options.operation !== undefined
          ? { operation: options.operation }
          : {}),
        ...(options.driver !== undefined ? { driver: options.driver } : {}),
        ...(options.databaseCode !== undefined
          ? { databaseCode: String(options.databaseCode) }
          : {}),
      },
    });
    this.operation = options.operation ?? DatabaseOperation.UNKNOWN;
    this.driver = options.driver;
    this.databaseCode = options.databaseCode;
  }

  public override toJSON() {
    return {
      ...super.toJSON(),
      operation: this.operation,
      ...(this.driver !== undefined ? { driver: this.driver } : {}),
      ...(this.databaseCode !== undefined
        ? { databaseCode: String(this.databaseCode) }
        : {}),
    };
  }
}

/** Creates a database error. */
export function createDatabaseError(
  message = "A database operation failed.",
  options: DatabaseErrorOptions = {},
): DatabaseError {
  return new DatabaseError(message, options);
}

/** Determines whether an unknown value is a DatabaseError. */
export function isDatabaseError(value: unknown): value is DatabaseError {
  return value instanceof DatabaseError;
}
