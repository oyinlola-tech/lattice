/**
 * zudo-cli — MySQL Database Adapter
 */

import type { DatabaseAdapter } from "./postgres.adapter.js";

export class MySqlAdapter implements DatabaseAdapter {
  readonly name = "mysql";
  readonly driver = "mysql";

  getConnectionString(dbName: string): string {
    return `mysql://localhost:3306/${dbName}`;
  }

  getDependencies(): readonly string[] {
    return ["@zudo/database"];
  }

  getEnvironmentVariables(): Record<string, string> {
    return {
      DATABASE_URL: "mysql://localhost:3306/mydb",
    };
  }
}
