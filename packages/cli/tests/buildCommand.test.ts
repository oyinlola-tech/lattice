/**
 * zudojs-cli — Build Command Tests
 *
 * Tests for the build command.
 */

import { describe, it, expect, vi } from "vitest";
import { runBuildCommand } from "../src/commands/build.command.js";
import type { CLIContext } from "../src/cliType/cliType.type.js";

function createContext(overrides?: Partial<CLIContext>): CLIContext {
  return {
    args: [],
    values: {},
    cwd: "/tmp",
    env: {},
    logger: {
      debug: () => {},
      info: vi.fn(),
      warn: () => {},
      error: vi.fn(),
      trace: () => {},
      fatal: () => {},
      child: () => ({}) as any,
      level: 3,
      flush: () => {},
    } as any,
    ...overrides,
  };
}

describe("runBuildCommand", () => {
  it("logs error when no project root is found", async () => {
    const context = createContext({ cwd: "/nonexistent" });
    await runBuildCommand(context);
    expect(context.logger.error).toHaveBeenCalled();
  });
});
