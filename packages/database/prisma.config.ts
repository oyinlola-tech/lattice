import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "./prisma/schema.prisma",
  datasource: {
    provider: "postgresql",
    url: "postgresql://localhost:5432/zudo",
  },
});
