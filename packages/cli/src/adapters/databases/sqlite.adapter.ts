/**
 * zudolib-cli — SQLite Database Adapter
 */

import type { DatabaseAdapter } from "./postgres.adapter.js";

export class SqliteAdapter implements DatabaseAdapter {
  readonly name = "sqlite";
  readonly driver = "sqlite";

  getConnectionString(dbName: string): string {
    return `sqlite:${dbName}.db`;
  }

  getDependencies(): readonly string[] {
    return ["@zudoliblib/database"];
  }

  getEnvironmentVariables(): Record<string, string> {
    return {
      DATABASE_URL: "sqlite:mydb.db",
    };
  }
}
