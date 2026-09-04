/**
 * zudojs-cli — Microservice Template
 *
 * Generated structure:
 * ```
 * project/
 * ├── apps/
 * │   ├── gateway/
 * │   │   ├── src/
 * │   │   ├── package.json
 * │   │   └── tsconfig.json
 * │   └── services/
 * │       └── identity/
 * │           ├── src/
 * │           ├── package.json
 * │           └── tsconfig.json
 * ├── infrastructure/
 * ├── package.json
 * ├── pnpm-workspace.yaml
 * ├── docker-compose.yml
 * ├── zudojs.config.ts
 * └── README.md
 * ```
 */

import type { ScaffoldOptions } from "../../types/index.js";

export function generateMicroserviceFiles(
  options: ScaffoldOptions,
): Record<string, string> {
  const nameSlug = options.projectName
    .replace(/[^a-z0-9-]+/gi, "-")
    .toLowerCase();
  const services =
    options.services.length > 0
      ? options.services
      : ["identity", "enrollment", "assessment", "notification"];

  const files: Record<string, string> = {};

  // Root package.json (workspace root)
  files["package.json"] =
    JSON.stringify(
      {
        name: nameSlug,
        version: "0.1.0",
        private: true,
        description: `Microservice architecture built with Zudojs framework`,
        scripts: {
          dev: "pnpm -r run dev",
          build: "pnpm -r run build",
          typecheck: "pnpm -r run typecheck",
        },
        devDependencies: {
          tsx: "^4.7.0",
          typescript: "^5.7.0",
        },
      },
      null,
      2,
    ) + "\n";

  files["pnpm-workspace.yaml"] = `packages:
  - gateway
  - services/*
`;

  files["zudojs.config.ts"] = `import { defineConfig } from "@zudojs/config";

export default defineConfig({
  application: {
    name: "${nameSlug}",
  },

  architecture: "microservice",

  runtime: {
    port: 3000,
    env: process.env.NODE_ENV ?? "development",
  },

  http: {
    enabled: true,
  },

  cqrs: {
    enabled: true,
  },
});
`;

  // Docker Compose
  let composeServices = "";
  for (let i = 0; i < services.length; i++) {
    const svc = services[i]!;
    const port = 3000 + i;
    composeServices += `  ${svc}:
    build:
      context: .
      dockerfile: apps/services/${svc}/Dockerfile
    ports:
      - "${port}:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
    depends_on: []
`;
  }

  files["docker-compose.yml"] = `services:
  gateway:
    build:
      context: .
      dockerfile: apps/gateway/Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - PORT=3000
${composeServices}
volumes:
  ${services.map((s) => `${s}-data:`).join("\n  ")}
`;

  files[".env.example"] = `NODE_ENV=development
PORT=3000
`;

  files[".gitignore"] = `node_modules/
dist/
.env
*.log.data/
`;

  files["README.md"] = `# ${options.projectName}

A microservice architecture built with the Zudojs framework.

## Services

${services.map((s, i) => `- **${s}** - Port ${3000 + i}`).join("\n")}

## Getting Started

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Docker

\`\`\`bash
docker-compose up
\`\`\`

## License

MIT
`;

  // Shared types
  files["src/types/index.ts"] = ``;

  // Gateway service
  const gatewayDeps = ["@zudojs/http", "@zudojs/config", "@zudojs/logger"];

  files["apps/gateway/package.json"] =
    JSON.stringify(
      {
        name: "@zudojsjs/gateway",
        version: "0.1.0",
        private: true,
        type: "module",
        scripts: {
          dev: "node --import tsx watch src/server.ts",
          start: "node dist/server.js",
          build: "tsc",
          typecheck: "tsc --noEmit",
        },
        dependencies: Object.fromEntries(
          gatewayDeps.map((d) => [d, "workspace:*"]),
        ),
        devDependencies: {
          tsx: "^4.7.0",
          typescript: "^5.7.0",
          "@types/node": "^22.0.0",
        },
      },
      null,
      2,
    ) + "\n";

  files["apps/gateway/tsconfig.json"] = `{
  "compilerOptions": {
    "target": "ES2024",
    "module": "Node16",
    "moduleResolution": "Node16",
    "allowImportingTsExtensions": true,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "lib": ["ES2024"],
    "types": ["node"]
  },
  "include": ["src/**/*"]
}
`;

  files["apps/gateway/Dockerfile"] = `FROM node:24-alpine AS builder
WORKDIR /app
COPY apps/gateway/package*.json ./
RUN npm ci
COPY apps/gateway/tsconfig.json ./
COPY apps/gateway/src ./src
RUN npx tsc

FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE 3000
CMD ["node", "dist/server.js"]
`;

  files["apps/gateway/src/index.ts"] =
    `export { createGateway } from "./app.js";
`;

  files["apps/gateway/src/app.ts"] = `import { logger } from "@zudojs/logger";

export async function createGateway() {
  const log = logger.child({ service: "gateway" });
  log.info("Gateway starting...");

  return {
    listen: async () => {
      log.info("Gateway listening on port 3000");
    },
    stop: async () => {
      log.info("Gateway shutting down...");
    },
  };
}
`;

  files["apps/gateway/src/server.ts"] =
    `import { createGateway } from "./app.js";
import { createRuntime } from "@zudojs/runtime";

const app = await createGateway();

const runtime = createRuntime({
  onShutdown: async () => {
    await app.stop();
  },
});

await runtime.start();
await app.listen();

process.on("SIGTERM", async () => {
  await runtime.stop();
  process.exit(0);
});
`;

  // Generate each service
  const serviceDeps = [
    "@zudojs/core",
    "@zudojs/container",
    "@zudojs/config",
    "@zudojs/logger",
    "@zudojs/errors",
    "@zudojs/constants",
    "@zudojs/http",
  ];

  if (options.enableCQRS) {
    serviceDeps.push("@zudojs/cqrs", "@zudojs/events");
  }

  for (const svc of services) {
    const svcName = svc!;
    const svcIndex = services.indexOf(svcName);
    const port = 3000 + svcIndex + 1;

    files[`apps/services/${svcName}/package.json`] =
      JSON.stringify(
        {
          name: `@zudojsjs/${nameSlug}-${svcName}`,
          version: "0.1.0",
          private: true,
          type: "module",
          scripts: {
            dev: "node --import tsx watch src/server.ts",
            start: "node dist/server.js",
            build: "tsc",
            typecheck: "tsc --noEmit",
          },
          dependencies: Object.fromEntries(
            [...new Set(serviceDeps)].map((d) => [d, "workspace:*"]),
          ),
          devDependencies: {
            tsx: "^4.7.0",
            typescript: "^5.7.0",
            "@types/node": "^22.0.0",
          },
        },
        null,
        2,
      ) + "\n";

    files[`apps/services/${svcName}/tsconfig.json`] = `{
  "compilerOptions": {
    "target": "ES2024",
    "module": "Node16",
    "moduleResolution": "Node16",
    "allowImportingTsExtensions": true,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "lib": ["ES2024"],
    "types": ["node"]
  },
  "include": ["src/**/*"]
}
`;

    files[`apps/services/${svcName}/Dockerfile`] =
      `FROM node:24-alpine AS builder
WORKDIR /app
COPY apps/services/${svcName}/package*.json ./
RUN npm ci
COPY tsconfig.base.json ../../tsconfig.base.json
COPY apps/services/${svcName}/tsconfig.json ./
COPY apps/services/${svcName}/src ./src
RUN npx tsc

FROM node:24-alpine AS runtime
WORKDIR /app
COPY --from=builder /app/dist ./dist
EXPOSE ${port}
CMD ["node", "dist/server.js"]
`;

    // Service structure
    const svcDirs = [
      "configs",
      "constants",
      "controllers",
      "databases",
      "dtos",
      "enums",
      "errors",
      "events",
      "interfaces",
      "jobs",
      "loaders",
      "middlewares",
      "models",
      "repositories",
      "routes",
      "types",
      "utils",
      "validators",
    ];

    files[`apps/services/${svcName}/src/index.ts`] =
      `export { createApp } from "./app.js";
`;

    files[`apps/services/${svcName}/src/app.ts`] =
      `import { logger } from "@zudojs/logger";
import { createContainer } from "@zudojs/container";

export async function createApp() {
  const log = logger.child({ service: "${svcName}" });
  const container = createContainer();

  log.info("${svcName} v0.1.0 starting...");

  return {
    container,
    listen: async () => {
      log.info("Listening on port ${port}");
    },
    stop: async () => {
      log.info("Shutting down...");
    },
  };
}
`;

    files[`apps/services/${svcName}/src/server.ts`] =
      `import { createApp } from "./app.js";
import { createRuntime } from "@zudojs/runtime";

const app = await createApp();

const runtime = createRuntime({
  onShutdown: async () => {
    await app.stop();
  },
});

await runtime.start();
await app.listen();

process.on("SIGTERM", async () => {
  await runtime.stop();
  process.exit(0);
});
`;

    files[`apps/services/${svcName}/src/controllers/index.ts`] = ``;
    files[`apps/services/${svcName}/src/services/index.ts`] = ``;

    files[`apps/services/${svcName}/src/services/${svcName}/index.ts`] = ``;

    for (const dir of svcDirs) {
      files[`apps/services/${svcName}/src/${dir}/index.ts`] = "";
    }
  }

  return files;
}
