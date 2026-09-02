/**
 * @oyinlola141/lattice-cli — Monolith Templates
 *
 * Template file generators for monolith architecture projects.
 *
 * Generated structure:
 * ```
 * project/
 * ├── src/
 * │   ├── index.ts      # exports only
 * │   ├── app.ts        # application assembly
 * │   ├── server.ts     # entry point
 * │   ├── configs/
 * │   ├── constants/
 * │   ├── controllers/
 * │   ├── databases/
 * │   ├── dtos/
 * │   ├── enums/
 * │   ├── errors/
 * │   ├── events/
 * │   ├── interfaces/
 * │   ├── jobs/
 * │   ├── loaders/
 * │   ├── loggers/
 * │   ├── middlewares/
 * │   ├── models/
 * │   ├── repositories/
 * │   ├── routes/
 * │   ├── services/
 * │   ├── types/
 * │   ├── utils/
 * │   └── validators/
 * ├── tests/
 * ├── package.json
 * ├── tsconfig.json
 * ├── lattice.config.ts
 * └── README.md
 * ```
 */

import type { ScaffoldOptions } from "../../types/index.js";

export function generateMonolithFiles(
  options: ScaffoldOptions,
): Record<string, string> {
  const name = options.projectName;
  const nameSlug = name.replace(/[^a-z0-9-]+/gi, "-").toLowerCase();

  const deps = [
    "@oyinlola141/lattice-core",
    "@oyinlola141/lattice-container",
    "@oyinlola141/lattice-config",
    "@oyinlola141/lattice-logger",
    "@oyinlola141/lattice-errors",
    "@oyinlola141/lattice-constants",
    "@oyinlola141/lattice-types",
    "@oyinlola141/lattice-validation",
    "@oyinlola141/lattice-schema",
    "@oyinlola141/lattice-http",
  ];

  if (options.enableCQRS) {
    deps.push(
      "@oyinlola141/lattice-cqrs",
      "@oyinlola141/lattice-events",
      "@oyinlola141/lattice-messaging",
    );
  }

  if (options.enableDatabase) {
    deps.push("@oyinlola141/lattice-database");
  }

  if (options.enableQueue) {
    deps.push("@oyinlola141/lattice-queue");
  }

  if (options.enableObservability) {
    deps.push("@oyinlola141/lattice-observability");
  }

  if (options.enableOpenAPI) {
    deps.push("@oyinlola141/lattice-openapi");
  }

  const devDeps = ["tsx", "typescript", "@types/node", "vitest"];

  const files: Record<string, string> = {};

  // Root files
  files["package.json"] =
    JSON.stringify(
      {
        name: nameSlug,
        version: "0.1.0",
        private: true,
        type: "module",
        license: "MIT",
        scripts: {
          dev: "node --import tsx watch src/server.ts",
          start: "node dist/server.js",
          build: "tsc",
          typecheck: "tsc --noEmit",
          test: "vitest run",
          lint: "tsc --noEmit",
        },
        dependencies: Object.fromEntries(
          [...new Set(deps)].map((d) => [d, "workspace:*"]),
        ),
        devDependencies: Object.fromEntries(devDeps.map((d) => [d, "^1.0.0"])),
      },
      null,
      2,
    ) + "\n";

  // tsconfig
  files["tsconfig.json"] = `{
  "compilerOptions": {
    "target": "ES2024",
    "module": "Node16",
    "moduleResolution": "Node16",
    "allowImportingTsExtensions": true,
    "strict": true,
    "noEmit": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "lib": ["ES2024"],
    "types": ["node"]
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
`;

  // lattice.config.ts
  files["lattice.config.ts"] =
    `import { defineConfig } from "@oyinlola141/lattice-config";

export default defineConfig({
  application: {
    name: "${nameSlug}",
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
    enabled: ${options.enableCQRS},
  },

  database: {
    enabled: ${options.enableDatabase},
  },

  events: {
    enabled: ${options.enableMessaging},
  },

  observability: {
    enabled: ${options.enableObservability},
  },
});
`;

  // Environment
  files[".env.example"] = `NODE_ENV=development
PORT=3000

DATABASE_URL=postgresql://localhost:5432/${nameSlug}
JWT_SECRET=change-this-in-production
`;

  files[".gitignore"] = `node_modules/
dist/
.env
*.log
.DS_Store
`;

  files["README.md"] = `# ${name}

A Lattice framework application.

## Getting Started

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## Structure

\`\`\`
src/
├── server.ts        # Entry point
├── app.ts           # Application assembly
├── configs/         # Configuration
├── constants/       # Shared constants
├── controllers/     # HTTP controllers
├── databases/       # Database connections
├── dtos/            # Data transfer objects
├── enums/           # Enumerations
├── errors/          # Error types
├── events/          # Domain events
├── interfaces/      # Shared interfaces
├── jobs/            # Background jobs
├── loaders/         # Module loaders
├── loggers/         # Logger configuration
├── middlewares/     # HTTP middleware
├── models/          # Data models
├── repositories/    # Data repositories
├── routes/          # HTTP routes
├── services/        # Application services
├── types/           # Shared types
├── utils/           # Utilities
└── validators/      # Input validators
\`\`\`

## License

MIT
`;

  // src/ entry points
  files["src/index.ts"] = `export { createApp } from "./app.js";
`;

  files["src/server.ts"] = `import { createApp } from "./app.js";
import { createRuntime } from "@oyinlola141/lattice-runtime";
import { logger } from "@oyinlola141/lattice-logger";

const app = await createApp();

const runtime = createRuntime({
  onShutdown: async () => {
    await app.stop();
  },
});

await runtime.start();

const server = await app.listen();

process.on("SIGTERM", async () => {
  await runtime.stop();
  process.exit(0);
});
`;

  files["src/app.ts"] = `import { logger } from "@oyinlola141/lattice-logger";
import { createContainer } from "@oyinlola141/lattice-container";

export async function createApp() {
  const log = logger.child({ service: "app" });
  const container = createContainer();

  log.info("${nameSlug} v0.1.0 starting...");

  return {
    container,
    listen: async () => {
      log.info("Server started");
    },
    stop: async () => {
      log.info("Shutting down...");
    },
  };
}
`;

  // Shared directories with empty index.ts
  const sharedDirs = [
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
    "loggers",
    "middlewares",
    "models",
    "repositories",
    "routes",
    "types",
    "utils",
    "validators",
  ];

  for (const dir of sharedDirs) {
    files[`src/${dir}/index.ts`] = "";
  }

  // Services with CQRS structure
  files["src/services/index.ts"] = ``;

  // Controllers
  files["src/controllers/health.controller.ts"] =
    `export class HealthController {
  check() {
    return { status: "ok", timestamp: new Date().toISOString() };
  }
}
`;

  files["src/controllers/index.ts"] =
    `export { HealthController } from "./health.controller.js";
`;

  // Tests
  files["tests/index.ts"] = `import { describe, it, expect } from "vitest";

describe("Application", () => {
  it("should be configured correctly", () => {
    expect(true).toBe(true);
  });
});
`;

  return files;
}
