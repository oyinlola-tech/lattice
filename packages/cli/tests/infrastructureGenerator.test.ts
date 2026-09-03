/**
 * @oyinlola141/lattice-cli — Infrastructure Generator Tests
 *
 * Tests for InfrastructureGenerator.
 */

import { describe, it, expect, vi } from "vitest";
import { InfrastructureGenerator } from "../src/generators/infrastructure/infrastructure.generator.js";
import { writeFileTree } from "../src/utils/utils.fileSystem.js";

vi.mock("../src/utils/utils.fileSystem.js", () => ({
  writeFileTree: vi.fn(async () => {}),
}));

describe("InfrastructureGenerator", () => {
  it("creates an instance", () => {
    const generator = new InfrastructureGenerator();
    expect(generator).toBeTruthy();
  });

  it("generates simple docker-compose for monolith", async () => {
    const generator = new InfrastructureGenerator();
    const files: Record<string, string> = {};

    await generator.generate(
      {
        projectName: "test-project",
        architecture: "monolith",
        database: "postgresql",
        packageManager: "pnpm",
      },
      "/tmp",
    );

    expect(writeFileTree).toHaveBeenCalled();
  });
});
