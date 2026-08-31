/**
 * Database error classes — re-exports from focused files.
 */

export {
  DatabaseError,
  createDatabaseError,
  isDatabaseError,
  DatabaseOperation,
} from "./databaseError.base.js";
export type { DatabaseErrorOptions } from "./databaseError.base.js";

export {
  databaseConnectionError,
  databaseQueryError,
  databaseTransactionError,
  databaseMigrationError,
} from "./databaseError.factory.js";
