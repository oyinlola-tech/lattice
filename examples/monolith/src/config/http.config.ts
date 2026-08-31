export interface HttpConfig { readonly port: number; readonly host: string; }
export function createHttpConfig(): HttpConfig {
  return { port: Number(process.env["PORT"] ?? 3000), host: process.env["HOST"] ?? "0.0.0.0" };
}
