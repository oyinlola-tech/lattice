import { defineConfig } from "@lattice/config";

export default defineConfig({
  application: {
    name: "test-app",
  },

  architecture: "monolith",

  runtime: {
    port: Number(process.env.PORT ?? 3000),
    env: process.env.NODE_ENV ?? "development",
    shutdownTimeout: 30_000,
  },

  http: {
    enabled: true,
    host: "0.0.0.0",
    port: Number(process.env.HTTP_PORT ?? 3000),
  },

  cqrs: {
    enabled: true,
  },

  database: {
    enabled: true,
  },

  events: {
    enabled: true,
  },

  observability: {
    enabled: true,
  },
});
