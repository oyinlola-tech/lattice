export interface AppConfig {
  readonly name: string;
  readonly version: string;
  readonly env: "development" | "production" | "test";
  readonly port: number;
  readonly host: string;
}

export interface DatabaseConfig {
  readonly filename: string;
  readonly verbose: boolean;
}

export interface LoggerConfig {
  readonly level: string;
  readonly enabled: boolean;
}

export interface HttpConfig {
  readonly port: number;
  readonly host: string;
  readonly cors: boolean;
}
