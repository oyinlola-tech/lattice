/**
 * zudolib-cli — Database Adapters
 *
 * Database adapters for project generation.
 */

export interface DatabaseAdapter {
  readonly name: string;
  readonly driver: string;

  getConnectionString(dbName: string): string;

  getDependencies(): readonly string[];

  getEnvironmentVariables(): Record<string, string>;
}

export class PostgresAdapter implements DatabaseAdapter {
  readonly name = "postgresql";
  readonly driver = "postgres";

  getConnectionString(dbName: string): string {
    return `postgresql://localhost:5432/${dbName}`;
  }

  getDependencies(): readonly string[] {
    return ["@zudoliblib/database"];
  }

  getEnvironmentVariables(): Record<string, string> {
    return {
      DATABASE_URL: "postgresql://localhost:5432/mydb",
    };
  }
}

export class MySqlAdapter implements DatabaseAdapter {
  readonly name = "mysql";
  readonly driver = "mysql";

  getConnectionString(dbName: string): string {
    return `mysql://localhost:3306/${dbName}`;
  }

  getDependencies(): readonly string[] {
    return ["@zudoliblib/database"];
  }

  getEnvironmentVariables(): Record<string, string> {
    return {
      DATABASE_URL: "mysql://localhost:3306/mydb",
    };
  }
}

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
