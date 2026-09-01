import type {
  AppConfig,
  DatabaseConfig,
  LoggerConfig,
  HttpConfig,
} from "../interfaces/index.js";

export function createAppConfig(): AppConfig {
  return {
    name: "community-knowledge-platform",
    version: "0.1.0",
    env: (process.env["NODE_ENV"] as AppConfig["env"]) ?? "development",
    port: parseInt(process.env["PORT"] ?? "3000", 10),
    host: process.env["HOST"] ?? "localhost",
  };
}

export function createDatabaseConfig(): DatabaseConfig {
  return {
    filename: process.env["DATABASE_FILENAME"] ?? "./data/community.db",
    verbose: process.env["DATABASE_VERBOSE"] === "true",
  };
}

export function createLoggerConfig(): LoggerConfig {
  return {
    level: process.env["LOG_LEVEL"] ?? "info",
    enabled: process.env["LOG_ENABLED"] !== "false",
  };
}

export function createHttpConfig(): HttpConfig {
  return {
    port: parseInt(process.env["PORT"] ?? "3000", 10),
    host: process.env["HOST"] ?? "localhost",
    cors: process.env["CORS_ENABLED"] !== "false",
  };
}
