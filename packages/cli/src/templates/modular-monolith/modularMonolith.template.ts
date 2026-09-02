/**
 * @oyinlola141/lattice-cli — Modular Monolith Template
 *
 * Generated structure:
 * ```
 * project/
 * ├── src/
 * │   ├── index.ts
 * │   ├── app.ts
 * │   ├── server.ts
 * │   ├── configs/
 * │   ├── constants/
 * │   ├── databases/
 * │   ├── errors/
 * │   ├── events/
 * │   ├── interfaces/
 * │   ├── loaders/
 * │   ├── middlewares/
 * │   ├── types/
 * │   ├── utils/
 * │   ├── validators/
 * │   └── modules/
 * │       └── identity/
 * │           ├── index.ts
 * │           ├── commands/
 * │           ├── queries/
 * │           └── events/
 * ├── tests/
 * ├── package.json
 * ├── tsconfig.json
 * ├── lattice.config.ts
 * └── README.md
 * ```
 */

import type { ScaffoldOptions } from "../../types/index.js";

export function generateModularMonolithFiles(
  options: ScaffoldOptions,
): Record<string, string> {
  const nameSlug = options.projectName
    .replace(/[^a-z0-9-]+/gi, "-")
    .toLowerCase();
  const modules =
    options.services.length > 0
      ? options.services
      : ["identity", "enrollment", "assessment"];

  const deps = [
    "@oyinlola141/lattice-core",
    "@oyinlola141/lattice-container",
    "@oyinlola141/lattice-config",
    "@oyinlola141/lattice-logger",
    "@oyinlola141/lattice-errors",
    "@oyinlola141/lattice-constants",
    "@oyinlola141/lattice-types",
    "@oyinlola141/lattice-validation",
    "@oyinlola141/lattice-cqrs",
    "@oyinlola141/lattice-events",
    "@oyinlola141/lattice-messaging",
    "@oyinlola141/lattice-http",
  ];

  const devDeps = ["tsx", "typescript", "@types/node", "vitest"];

  const files: Record<string, string> = {};

  // package.json
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
        },
        dependencies: Object.fromEntries(deps.map((d) => [d, "workspace:*"])),
        devDependencies: Object.fromEntries(devDeps.map((d) => [d, "^1.0.0"])),
      },
      null,
      2,
    ) + "\n";

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

  files["lattice.config.ts"] =
    `import { defineConfig } from "@oyinlola141/lattice-config";

export default defineConfig({
  application: {
    name: "${nameSlug}",
  },

  architecture: "modular-monolith",

  runtime: {
    port: Number(process.env.PORT ?? 3000),
    env: process.env.NODE_ENV ?? "development",
  },

  http: {
    enabled: true,
    port: 3000,
  },

  cqrs: {
    enabled: true,
  },

  database: {
    enabled: true,
  },
});
`;

  files[".env.example"] = `NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://localhost:5432/${nameSlug}
`;

  files[".gitignore"] = `node_modules/
dist/
.env
*.log
`;

  files["README.md"] = `# ${options.projectName}

A modular monolith built with the Lattice framework.

## Architecture

This project uses a **modular monolith** architecture with the following modules:

${modules.map((m) => `- **${m}**`).join("\n")}

## Getting Started

\`\`\`bash
pnpm install
pnpm dev
\`\`\`

## License

MIT
`;

  // Shared source directories
  files["src/index.ts"] = `export { createApp } from "./app.js";
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

  files["src/server.ts"] = `import { createApp } from "./app.js";
import { createRuntime } from "@oyinlola141/lattice-runtime";

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

  const sharedDirs = [
    "configs",
    "constants",
    "databases",
    "errors",
    "events",
    "interfaces",
    "loaders",
    "middlewares",
    "types",
    "utils",
    "validators",
  ];

  for (const dir of sharedDirs) {
    files[`src/${dir}/index.ts`] = "";
  }

  files["src/modules/index.ts"] =
    modules.map((m) => `export * from "./${m}/index.js";`).join("\n") + "\n";

  // Generate each module with CQRS structure
  for (const mod of modules) {
    const modName = mod!;
    const modNamePascal = modName
      .replace(/-([a-z])/g, (_m: string, c: string) => c.toUpperCase())
      .replace(/^./, (c: string) => c.toUpperCase());

    files[`src/modules/${modName}/index.ts`] =
      `export { ${modNamePascal}Module } from "./${modName}.module.js";
`;

    files[`src/modules/${modName}/${modName}.module.ts`] =
      `import { logger } from "@oyinlola141/lattice-logger";

export class ${modNamePascal}Module {
  private readonly log = logger.child({ module: "${modName}" });

  id = "${modName}-module";

  initialize() {
    this.log.info("${modName} module initialized");
  }
}
`;

    // CQRS structure
    files[`src/modules/${modName}/commands/index.ts`] = ``;
    files[`src/modules/${modName}/queries/index.ts`] = ``;
    files[`src/modules/${modName}/events/index.ts`] = ``;
  }

  files["tests/index.ts"] = `import { describe, it, expect } from "vitest";

describe("Application", () => {
  it("should bootstrap correctly", () => {
    expect(true).toBe(true);
  });
});
`;

  return files;
}
