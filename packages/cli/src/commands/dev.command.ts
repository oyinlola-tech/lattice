/**
 * zudo-cli — Dev Command
 *
 * The `lattice dev` command.
 * Starts development servers based on project configuration.
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { execCommand } from "../utils/utils.exec.js";
import type { CLIContext } from "../cliType/cliType.type.js";
import { CLIValidationError, CLIGenerationError } from "../errors/index.js";
import { ManifestManager } from "../manifest/manifestManager.core.js";

interface DevOptions {
  readonly frontendOnly: boolean;
  readonly backendOnly: boolean;
  readonly port?: number;
}

export async function runDevCommand(context: CLIContext): Promise<void> {
  const frontendOnly = context.values["frontend-only"] === true;
  const backendOnly = context.values["backend-only"] === true;
  const port = context.values.port as number | undefined;

  if (frontendOnly && backendOnly) {
    throw new CLIValidationError(
      "Cannot use --frontend-only and --backend-only together.",
    );
  }

  const config = readProjectConfig(context.cwd);

  if (!config) {
    throw new CLIValidationError(
      "No Lattice project found. Run `lattice create` first.",
    );
  }

  context.logger.info(`Starting development server for: ${config.name}`);
  context.logger.info(`Type: ${config.type}`);

  if (config.backend) {
    context.logger.info(`Backend architecture: ${config.backend.architecture}`);
  }

  if (config.frontend) {
    context.logger.info(`Frontend: ${config.frontend.framework}`);
  }

  const manifest = await new ManifestManager(context.cwd).read();
  const services = manifest?.capabilities ?? [];

  const processes: Promise<void>[] = [];

  if (
    (!frontendOnly && config.type === "backend") ||
    config.type === "fullstack"
  ) {
    if (config.backend?.architecture === "microservice") {
      processes.push(...startMicroserviceDev(context.cwd, services));
    } else {
      processes.push(startBackendDev(context.cwd, config, port));
    }
  }

  if (
    !backendOnly &&
    (config.type === "frontend" || config.type === "fullstack")
  ) {
    if (config.frontend && config.frontend.framework !== "none") {
      processes.push(startFrontendDev(context.cwd, config));
    }
  }

  if (processes.length === 0) {
    context.logger.warn("No development servers to start.");
    return;
  }

  context.logger.info("Starting development servers...");

  try {
    await Promise.all(processes);
  } catch (error) {
    throw new CLIGenerationError("Development server failed to start.", error);
  }
}

function readProjectConfig(cwd: string): {
  readonly name: string;
  readonly type: string;
  readonly backend?: { readonly architecture: string };
  readonly frontend?: { readonly framework: string };
} | null {
  const configPath = join(cwd, "lattice.config.ts");
  const configPathJs = join(cwd, "lattice.config.js");

  if (existsSync(configPath)) {
    const content = readFileSync(configPath, "utf-8");
    return parseConfigContent(content, cwd);
  }

  if (existsSync(configPathJs)) {
    const content = readFileSync(configPathJs, "utf-8");
    return parseConfigContent(content, cwd);
  }

  const pkgPath = join(cwd, "package.json");
  if (existsSync(pkgPath)) {
    const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
      name?: string;
      lattice?: {
        projectType?: string;
        architecture?: string;
        frontend?: string;
      };
    };

    if (pkg.lattice) {
      return {
        name: pkg.name ?? "unknown",
        type: pkg.lattice.projectType ?? "backend",
        backend: pkg.lattice.architecture
          ? { architecture: pkg.lattice.architecture }
          : undefined,
        frontend: pkg.lattice.frontend
          ? { framework: pkg.lattice.frontend }
          : undefined,
      };
    }
  }

  return null;
}

function parseConfigContent(
  content: string,
  cwd: string,
): {
  readonly name: string;
  readonly type: string;
  readonly backend?: { readonly architecture: string };
  readonly frontend?: { readonly framework: string };
} {
  const nameMatch = content.match(/name:\s*["']([^"']+)["']/);
  const typeMatch = content.match(/projectType:\s*["'](\w+)["']/);
  const architectureMatch = content.match(/architecture:\s*["'](\w+)["']/);
  const frontendMatch = content.match(
    /frontend:\s*\{[\s\S]*?framework:\s*["']([^"']+)["']/,
  );

  const pkgPath = join(cwd, "package.json");
  let name = "unknown";

  if (existsSync(pkgPath)) {
    try {
      const pkg = JSON.parse(readFileSync(pkgPath, "utf-8")) as {
        name?: string;
      };
      name = pkg.name ?? name;
    } catch {
      // ignore
    }
  }

  return {
    name: nameMatch?.[1] ?? name,
    type: typeMatch?.[1] ?? "backend",
    backend: architectureMatch?.[1]
      ? { architecture: architectureMatch[1] }
      : undefined,
    frontend: frontendMatch?.[1] ? { framework: frontendMatch[1] } : undefined,
  };
}

async function startBackendDev(
  cwd: string,
  config: { readonly backend?: { readonly architecture: string } },
  port?: number,
): Promise<void> {
  const portFlag = port ? [`--port=${port}`] : [];

  if (config.backend?.architecture === "microservice") {
    await execCommand("tsx", ["watch", "apps/gateway/src", ...portFlag], cwd);
  } else {
    await execCommand("tsx", ["watch", "src", ...portFlag], cwd);
  }
}

function startMicroserviceDev(
  cwd: string,
  services: readonly string[],
): Promise<void>[] {
  const serviceDirs = services.map((service) => join(cwd, "apps", service));
  const promises: Promise<void>[] = [];

  for (const dir of serviceDirs) {
    if (existsSync(join(dir, "src"))) {
      promises.push(execCommand("tsx", ["watch", "src"], dir).then(() => {}));
    }
  }

  return promises;
}

async function startFrontendDev(
  cwd: string,
  config: { readonly frontend?: { readonly framework: string } },
): Promise<void> {
  const framework = config.frontend?.framework ?? "react";
  const frontendDir = join(cwd, "apps", "web");

  switch (framework) {
    case "react":
      await execCommand("npm", ["run", "dev"], frontendDir);
      break;

    case "next":
      await execCommand("npm", ["run", "dev"], frontendDir);
      break;

    case "vue":
      await execCommand("npm", ["run", "dev"], frontendDir);
      break;

    case "nuxt":
      await execCommand("npm", ["run", "dev"], frontendDir);
      break;

    case "angular":
      await execCommand("ng", ["serve"], frontendDir);
      break;

    case "svelte":
      await execCommand("npm", ["run", "dev"], frontendDir);
      break;

    case "sveltekit":
      await execCommand("npm", ["run", "dev"], frontendDir);
      break;

    case "astro":
      await execCommand("npm", ["run", "dev"], frontendDir);
      break;

    case "vanilla":
      await execCommand("npm", ["run", "dev"], frontendDir);
      break;

    case "flutter":
      await execCommand("flutter", ["run", "--debug"], frontendDir);
      break;

    case "react-native":
      await execCommand("npx", ["react-native", "start"], frontendDir);
      break;

    default:
      await execCommand("npm", ["run", "dev"], frontendDir);
  }
}
