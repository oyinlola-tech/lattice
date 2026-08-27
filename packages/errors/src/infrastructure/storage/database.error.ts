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
 * Database operation types used for diagnostics.
 */
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

/**
 * Options for creating a database error.
 */
export interface DatabaseErrorOptions
  extends Omit<
    BaseErrorOptions,
    "category"
  > {
  readonly category?: ErrorCategory;

  /**
   * Database operation that produced the error.
   */
  readonly operation?: DatabaseOperation;

  /**
   * Database driver or provider name.
   */
  readonly driver?: string;

  /**
   * Database error code returned by the underlying driver.
   */
  readonly databaseCode?: string | number;
}

/**
 * Error raised by a database or persistence operation.
 */
export class DatabaseError
  extends BaseError {
  public readonly operation: DatabaseOperation;

  public readonly driver?: string;

  public readonly databaseCode?: string | number;

  constructor(
    message =
      "A database operation failed.",
    options: DatabaseErrorOptions = {},
  ) {
    super(
      message,
      {
        ...options,
        code:
          options.code ??
          ErrorCode.DATABASE,
        category:
          options.category ??
          ErrorCategory.DATABASE,
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
          ...(options.driver !==
          undefined
            ? {
                driver:
                  options.driver,
              }
            : {}),
          ...(options.databaseCode !==
          undefined
            ? {
                databaseCode:
                  String(
                    options.databaseCode,
                  ),
              }
            : {}),
        },
      },
    );

    this.operation =
      options.operation ??
      DatabaseOperation.UNKNOWN;

    this.driver =
      options.driver;

    this.databaseCode =
      options.databaseCode;
  }

  /**
   * Returns a serialized representation with database diagnostics.
   *
   * Sensitive database internals should still be filtered before sending
   * this representation to an untrusted client.
   */
  public override toJSON() {
    return {
      ...super.toJSON(),
      operation:
        this.operation,
      ...(this.driver !==
      undefined
        ? {
            driver:
              this.driver,
          }
        : {}),
      ...(this.databaseCode !==
      undefined
        ? {
            databaseCode:
              String(
                this.databaseCode,
              ),
          }
        : {}),
    };
  }
}

/**
 * Creates a database error.
 */
export function createDatabaseError(
  message =
    "A database operation failed.",
  options: DatabaseErrorOptions = {},
): DatabaseError {
  return new DatabaseError(
    message,
    options,
  );
}

/**
 * Determines whether an unknown value is a DatabaseError.
 */
export function isDatabaseError(
  value: unknown,
): value is DatabaseError {
  return (
    value instanceof DatabaseError
  );
}

/**
 * Creates a database connection error.
 */
export function databaseConnectionError(
  message =
    "Unable to connect to the database.",
  options: Omit<
    DatabaseErrorOptions,
    "operation"
  > = {},
): DatabaseError {
  return new DatabaseError(
    message,
    {
      ...options,
      code:
        ErrorCode.DATABASE_CONNECTION,
      operation:
        DatabaseOperation.CONNECT,
    },
  );
}

/**
 * Creates a database query error.
 */
export function databaseQueryError(
  message =
    "The database query failed.",
  options: Omit<
    DatabaseErrorOptions,
    "operation"
  > = {},
): DatabaseError {
  return new DatabaseError(
    message,
    {
      ...options,
      code:
        ErrorCode.DATABASE_QUERY,
      operation:
        DatabaseOperation.QUERY,
    },
  );
}

/**
 * Creates a database transaction error.
 */
export function databaseTransactionError(
  message =
    "The database transaction failed.",
  options: Omit<
    DatabaseErrorOptions,
    "operation"
  > = {},
): DatabaseError {
  return new DatabaseError(
    message,
    {
      ...options,
      code:
        ErrorCode.DATABASE_TRANSACTION,
      operation:
        DatabaseOperation.TRANSACTION,
    },
  );
}

/**
 * Creates a database migration error.
 */
export function databaseMigrationError(
  message =
    "The database migration failed.",
  options: Omit<
    DatabaseErrorOptions,
    "operation"
  > = {},
): DatabaseError {
  return new DatabaseError(
    message,
    {
      ...options,
      code:
        ErrorCode.DATABASE,
      operation:
        DatabaseOperation.MIGRATION,
    },
  );
}