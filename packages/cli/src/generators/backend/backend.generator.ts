/**
 * zudojs-cli — Backend Generator
 *
 * Generates backend projects for monolith, modular monolith, and microservice architectures.
 */

import type { ScaffoldOptions } from "../../types/index.js";
import { generateMonolithFiles } from "../../templates/monolith/index.js";
import { generateModularMonolithFiles } from "../../templates/modular-monolith/index.js";
import { generateMicroserviceFiles } from "../../templates/microservice/index.js";

export class BackendGenerator {
  async generate(
    options: ScaffoldOptions,
    basePath: string,
  ): Promise<Record<string, string>> {
    switch (options.architecture) {
      case "modular-monolith":
        return generateModularMonolithFiles(options);
      case "microservice":
        return generateMicroserviceFiles(options);
      default:
        return generateMonolithFiles(options);
    }
  }

  getSupportedArchitectures(): readonly string[] {
    return ["monolith", "modular-monolith", "microservice"];
  }
}
