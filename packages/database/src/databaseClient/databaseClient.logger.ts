/**
 * @oyinlola141/lattice-database — Default Logger
 *
 * Minimal logger for environments where no application logger has been configured yet.
 */

import type { DatabaseLogger } from "../databaseType/databaseType.type.js";

/** Creates a minimal logger for environments where no application logger has been configured yet. */
export function createDefaultLogger(): DatabaseLogger {
  return {
    debug: (message, metadata) => {
      if (process.env.NODE_ENV !== "production") {
        console.debug(message, metadata);
      }
    },
    info: (message, metadata) => {
      if (process.env.NODE_ENV !== "production") {
        console.info(message, metadata);
      }
    },
    warn: (message, metadata) => {
      console.warn(message, metadata);
    },
    error: (message, error, metadata) => {
      console.error(message, error, metadata);
    },
  };
}
