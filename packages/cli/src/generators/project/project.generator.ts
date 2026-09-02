import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { ScaffoldOptions } from "../../types/index.js";
import { writeFileTree } from "../../utils/utils.fileSystem.js";
import { execCommand } from "../../utils/utils.exec.js";
import { CLI_VERSION } from "../../constants/index.js";
import { generateMonolithFiles } from "../../templates/monolith/index.js";
import { generateModularMonolithFiles } from "../../templates/modular-monolith/index.js";
import { generateMicroserviceFiles } from "../../templates/microservice/index.js";
import { CLIGenerationError } from "../../errors/index.js";

export interface GenerateProjectResult {
  readonly projectPath: string;
  readonly filesCreated: readonly string[];
}

export async function generateProject(
  options: ScaffoldOptions,
  basePath = ".",
): Promise<GenerateProjectResult> {
  let templateFiles: Record<string, string>;

  switch (options.architecture) {
    case "monolith":
      templateFiles = generateMonolithFiles(options);
      break;
    case "modular-monolith":
      templateFiles = generateModularMonolithFiles(options);
      break;
    case "microservice":
      templateFiles = generateMicroserviceFiles(options);
      break;
    default:
      throw new CLIGenerationError(
        `Unknown architecture: ${options.architecture}`,
      );
  }

  const projectPath = join(basePath, options.projectName);

  try {
    await mkdir(projectPath, { recursive: true });
  } catch (error) {
    throw new CLIGenerationError(
      `Failed to create project directory: ${projectPath}`,
      error,
    );
  }

  try {
    await writeFileTree(projectPath, templateFiles);
  } catch (error) {
    throw new CLIGenerationError(`Failed to write project files:`, error);
  }

  const filesCreated = Object.keys(templateFiles);

  if (options.initGit) {
    try {
      await execCommand("git init", projectPath);
      await execCommand(`git config user.name "Lattice CLI"`, projectPath);
      await execCommand(`git config user.email "cli@lattice.dev"`, projectPath);
      await execCommand("git add -A", projectPath);
      await execCommand(
        'git commit -m "chore: initial commit from Lattice CLI"',
        projectPath,
      );
    } catch {
      // Git operations are best-effort; non-fatal
    }
  }

  if (options.installDeps) {
    try {
      const installCmd =
        options.packageManager === "pnpm"
          ? "pnpm install"
          : options.packageManager === "yarn"
            ? "yarn install"
            : "npm install";

      await execCommand(installCmd, projectPath);
    } catch (error) {
      throw new CLIGenerationError(
        `Failed to install dependencies. Run manually: cd ${options.projectName} && ${options.packageManager} install`,
        error,
      );
    }
  }

  return {
    projectPath,
    filesCreated,
  };
}

export function getLatticeVersion(): string {
  return CLI_VERSION;
}
