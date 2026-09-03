/**
 * zudolib-cli — Backend Architecture Prompt
 *
 * Prompts for backend architecture selection.
 */

import * as p from "@clack/prompts";
import type { BackendArchitecture } from "../../types/projectConfiguration.type.js";

export async function promptBackendArchitecture(
  overrides?: BackendArchitecture,
): Promise<BackendArchitecture> {
  const value =
    overrides ??
    (await p.select({
      message: "Select backend architecture",
      options: [
        {
          value: "monolith",
          label: "Monolith",
          hint: "Single application",
        },
        {
          value: "modular-monolith",
          label: "Modular Monolith",
          hint: "Modular single application",
        },
        {
          value: "microservice",
          label: "Microservices",
          hint: "Independent services",
        },
      ],
    }));

  if (p.isCancel(value)) {
    p.cancel("Operation cancelled.");
    process.exit(0);
  }

  return value;
}
