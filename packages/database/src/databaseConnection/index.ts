/**
 * @zudojs/database — Database Connection
 *
 * Connection lifecycle management with health checks.
 */

export {
  DatabaseConnectionManager,
  createConnectionManager,
  type DatabaseConnectionEvent,
  type DatabaseConnectionListener,
  type DatabaseConnectionEventDetails,
  type DatabaseConnectionManagerOptions,
} from "./databaseConnection.manager.js";
