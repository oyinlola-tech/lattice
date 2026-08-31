/**
 * Application configuration.
 *
 * Loaded from environment variables with sensible defaults.
 */

export interface AppConfig {
  readonly port: number;
  readonly host: string;
  readonly nodeEnv: string;
}

export function loadConfig(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    host: process.env.HOST ?? "0.0.0.0",
    nodeEnv: process.env.NODE_ENV ?? "development",
  };
}
