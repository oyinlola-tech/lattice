export interface AppConfig {
  readonly name: string;
  readonly version: string;
  readonly env: "development" | "production" | "test";
}
export function createAppConfig(): AppConfig {
  return {
    name: "zudolib-monolith",
    version: "0.1.0",
    env: (process.env["NODE_ENV"] as AppConfig["env"]) ?? "development",
  };
}
