import type { GatewayConfig } from "../interfaces/index.js";

export function createGatewayConfig(): GatewayConfig {
  return {
    port: parseInt(process.env["GATEWAY_PORT"] ?? "3000", 10),
    host: process.env["GATEWAY_HOST"] ?? "localhost",
    jwtSecret:
      process.env["JWT_SECRET"] ?? "dev-secret-key-change-in-production",
    corsOrigin: process.env["CORS_ORIGIN"] ?? "*",
    services: {
      identity: {
        name: "identity",
        url: process.env["IDENTITY_SERVICE_URL"] ?? "http://localhost:3001",
        timeout: 10_000,
      },
      enrollment: {
        name: "enrollment",
        url: process.env["ENROLLMENT_SERVICE_URL"] ?? "http://localhost:3002",
        timeout: 10_000,
      },
      assessment: {
        name: "assessment",
        url: process.env["ASSESSMENT_SERVICE_URL"] ?? "http://localhost:3003",
        timeout: 10_000,
      },
      notification: {
        name: "notification",
        url: process.env["NOTIFICATION_SERVICE_URL"] ?? "http://localhost:3004",
        timeout: 10_000,
      },
    },
  };
}
