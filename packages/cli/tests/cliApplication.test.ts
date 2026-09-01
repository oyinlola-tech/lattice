/**
 * @oyinlola141/lattice-cli — CLI Application Tests
 *
 * Tests for LatticeCLI, builtins, writer, runner, help generator,
 * and version utilities.
 */

import { describe, it, expect, vi } from "vitest";

import {
  LatticeCLI,
  createCLI,
} from "../src/cliApplication/cliApplication.core.js";
import {
  isHelpRequest,
  isVersionRequest,
  printVersion,
  printHelp,
} from "../src/cliApplication/cliApplication.builtins.js";
import {
  createCLIWriter,
  registerCLIInterruptHandler,
} from "../src/cliApplication/cliApplication.writer.js";
import {
  CLIRunner,
  createCLIRunner,
  runCLICommand,
} from "../src/cliRunner/cliRunner.core.js";
import {
  CLIHelpGenerator,
  createHelpGenerator,
  generateCLIHelp,
  generateCommandHelp,
} from "../src/cliHelp/cliHelp.generator.js";
import {
  formatTitle,
  formatCommands,
  formatOptions,
  formatArguments,
  formatAliases,
  formatOptionLabel,
  formatArgumentLabel,
  formatUsageSuffix,
  formatGlobalOptions,
} from "../src/cliHelp/cliHelp.formatter.js";
import {
  getCLIVersion,
  formatCLIVersion,
  getVersionString,
  isValidVersion,
  compareVersions,
  parseVersion,
  isCompatibleVersion,
} from "../src/cliVersion/cliVersion.core.js";
import {
  createCommand,
  createCommand as cmd,
} from "../src/cliCommand/cliCommand.factory.js";
import { CLI_EXIT_CODES } from "../src/cliConstant/cliConstant.value.js";
import type { CLICommand, CLIWriter } from "../src/cliType/cliType.type.js";

// ─── Helpers ───────────────────────────────────────────────────────────────

function createMockWriter(): CLIWriter & { stdout: string; stderr: string } {
  let stdout = "";
  let stderr = "";
  return {
    get stdout() {
      return stdout;
    },
    get stderr() {
      return stderr;
    },
    write(message: string) {
      stdout += message;
    },
    writeLine(message = "") {
      stdout += message + "\n";
    },
    error(message: string) {
      stderr += message;
    },
    errorLine(message = "") {
      stderr += message + "\n";
    },
    reset() {
      stdout = "";
      stderr = "";
    },
  };
}

// ─── Builtins ──────────────────────────────────────────────────────────────

describe("isHelpRequest", () => {
  it("detects --help", () => {
    expect(isHelpRequest(["--help"])).toBe(true);
  });

  it("detects -h", () => {
    expect(isHelpRequest(["-h"])).toBe(true);
  });

  it("detects help command", () => {
    expect(isHelpRequest(["help"])).toBe(true);
  });

  it("returns false for non-help args", () => {
    expect(isHelpRequest(["start"])).toBe(false);
    expect(isHelpRequest([])).toBe(false);
  });
});

describe("isVersionRequest", () => {
  it("detects --version", () => {
    expect(isVersionRequest(["--version"])).toBe(true);
  });

  it("detects -v", () => {
    expect(isVersionRequest(["-v"])).toBe(true);
  });

  it("detects version command", () => {
    expect(isVersionRequest(["version"])).toBe(true);
  });

  it("returns false for non-version args", () => {
    expect(isVersionRequest(["start"])).toBe(false);
  });
});

describe("printVersion", () => {
  it("prints the version", () => {
    const writer = createMockWriter();
    printVersion(writer, "1.0.0");
    expect(writer.stdout).toContain("1.0.0");
  });

  it("prints default version when none given", () => {
    const writer = createMockWriter();
    printVersion(writer);
    expect(writer.stdout).toBeTruthy();
  });
});

describe("printHelp", () => {
  it("prints application name", () => {
    const writer = createMockWriter();
    printHelp(writer, "my-app", "1.0.0", "My app", []);
    expect(writer.stdout).toContain("my-app");
    expect(writer.stdout).toContain("1.0.0");
  });

  it("prints command list", () => {
    const writer = createMockWriter();
    const commands: CLICommand[] = [
      createCommand({ name: "start", execute: () => {} }),
      createCommand({ name: "stop", execute: () => {} }),
    ];
    printHelp(writer, "app", undefined, undefined, commands);
    expect(writer.stdout).toContain("start");
    expect(writer.stdout).toContain("stop");
  });

  it("prints 'No commands registered' for empty list", () => {
    const writer = createMockWriter();
    printHelp(writer, "app");
    expect(writer.stdout).toContain("No commands registered");
  });
});

// ─── CLI Writer ────────────────────────────────────────────────────────────

describe("createCLIWriter", () => {
  it("creates a writer with write methods", () => {
    const writer = createCLIWriter();
    expect(typeof writer.write).toBe("function");
    expect(typeof writer.writeLine).toBe("function");
    expect(typeof writer.error).toBe("function");
    expect(typeof writer.errorLine).toBe("function");
  });
});

// ─── LatticeCLI ────────────────────────────────────────────────────────────

describe("LatticeCLI", () => {
  it("creates with default options", () => {
    const cli = new LatticeCLI();
    expect(cli.name).toBe("lattice");
    expect(cli.version).toBeTruthy();
  });

  it("creates with custom options", () => {
    const cli = new LatticeCLI({
      name: "my-app",
      version: "2.0.0",
      description: "My application",
    });
    expect(cli.name).toBe("my-app");
    expect(cli.version).toBe("2.0.0");
    expect(cli.description).toBe("My application");
  });

  it("registers commands", () => {
    const cli = new LatticeCLI();
    const cmd = createCommand({ name: "test", execute: () => {} });
    cli.register(cmd);
    expect(cli.commandCount).toBe(1);
  });

  it("registers multiple commands", () => {
    const cli = new LatticeCLI();
    cli.registerMany([
      createCommand({ name: "a", execute: () => {} }),
      createCommand({ name: "b", execute: () => {} }),
    ]);
    expect(cli.commandCount).toBe(2);
  });

  it("returns exit code 0 for --help", async () => {
    const cli = new LatticeCLI();
    const code = await cli.run(["--help"]);
    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
  });

  it("returns exit code 0 for --version", async () => {
    const cli = new LatticeCLI({ version: "1.0.0" });
    const code = await cli.run(["--version"]);
    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
  });

  it("returns exit code 0 for no args (shows help)", async () => {
    const cli = new LatticeCLI();
    const code = await cli.run([]);
    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
  });

  it("returns error exit code for unknown command", async () => {
    const cli = new LatticeCLI();
    const code = await cli.run(["nonexistent"]);
    expect(code).not.toBe(CLI_EXIT_CODES.SUCCESS);
  });

  it("executes a registered command", async () => {
    let executed = false;
    const cli = new LatticeCLI();
    cli.register(
      createCommand({
        name: "test",
        execute: () => {
          executed = true;
        },
      }),
    );
    const code = await cli.run(["test"]);
    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
    expect(executed).toBe(true);
  });

  it("returns general error for command execution failure", async () => {
    const cli = new LatticeCLI();
    cli.register(
      createCommand({
        name: "fail",
        execute: () => {
          throw new Error("boom");
        },
      }),
    );
    const code = await cli.run(["fail"]);
    expect(code).toBe(CLI_EXIT_CODES.GENERAL_ERROR);
  });

  it("prevents concurrent runs", async () => {
    const cli = new LatticeCLI();
    cli.register(
      createCommand({
        name: "slow",
        execute: () => new Promise((r) => setTimeout(r, 100)),
      }),
    );

    // Start first run
    const p1 = cli.run(["slow"]);
    // Try to start second run while first is in progress — should throw
    await expect(cli.run(["slow"])).rejects.toThrow();

    // Wait for first to finish
    await p1;
  });

  it("reports isRunning correctly", async () => {
    const cli = new LatticeCLI();
    cli.register(
      createCommand({
        name: "slow",
        execute: () => new Promise((r) => setTimeout(r, 50)),
      }),
    );
    expect(cli.isRunning).toBe(false);
    const p = cli.run(["slow"]);
    // Small delay to let it start
    await new Promise((r) => setTimeout(r, 5));
    expect(cli.isRunning).toBe(true);
    await p;
    expect(cli.isRunning).toBe(false);
  });

  it("calls lifecycle hooks", async () => {
    const beforeRun = vi.fn();
    const afterRun = vi.fn();
    const cli = new LatticeCLI();
    cli.use({ beforeRun, afterRun });
    cli.register(createCommand({ name: "test", execute: () => {} }));
    await cli.run(["test"]);
    expect(beforeRun).toHaveBeenCalled();
    expect(afterRun).toHaveBeenCalled();
  });
});

describe("createCLI", () => {
  it("creates a LatticeCLI instance", () => {
    const cli = createCLI({ name: "test-app" });
    expect(cli).toBeInstanceOf(LatticeCLI);
    expect(cli.name).toBe("test-app");
  });
});

// ─── CLIRunner ─────────────────────────────────────────────────────────────

describe("CLIRunner", () => {
  function createDummyContext() {
    return {
      args: [],
      values: {},
      cwd: "/tmp",
      env: {},
      logger: {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        trace: () => {},
        fatal: () => {},
        child: () => ({}) as any,
        level: 3,
        flush: () => {},
      } as any,
    };
  }

  it("runs a command successfully", async () => {
    let executed = false;
    const runner = createCLIRunner();
    const cmd = createCommand({
      name: "test",
      execute: () => {
        executed = true;
      },
    });
    const code = await runner.run(cmd, createDummyContext());
    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
    expect(executed).toBe(true);
  });

  it("returns GENERAL_ERROR when already running", async () => {
    const runner = createCLIRunner();
    const cmd = createCommand({
      name: "slow",
      execute: () => new Promise((r) => setTimeout(r, 100)),
    });
    const ctx = createDummyContext();
    const p1 = runner.run(cmd, ctx);
    const code = await runner.run(cmd, ctx);
    expect(code).toBe(CLI_EXIT_CODES.GENERAL_ERROR);
    await p1;
  });

  it("reports isRunning", async () => {
    const runner = createCLIRunner();
    const cmd = createCommand({
      name: "slow",
      execute: () => new Promise((r) => setTimeout(r, 50)),
    });
    expect(runner.isRunning).toBe(false);
    const p = runner.run(cmd, createDummyContext());
    await new Promise((r) => setTimeout(r, 5));
    expect(runner.isRunning).toBe(true);
    await p;
    expect(runner.isRunning).toBe(false);
  });

  it("handles errors gracefully", async () => {
    const runner = createCLIRunner();
    const cmd = createCommand({
      name: "fail",
      execute: () => {
        throw new Error("boom");
      },
    });
    const code = await runner.run(cmd, createDummyContext());
    expect(code).toBe(CLI_EXIT_CODES.GENERAL_ERROR);
  });

  it("calls beforeRun and afterRun hooks", async () => {
    const beforeRun = vi.fn();
    const afterRun = vi.fn();
    const runner = createCLIRunner({ hooks: { beforeRun, afterRun } });
    const cmd = createCommand({ name: "test", execute: () => {} });
    await runner.run(cmd, createDummyContext());
    expect(beforeRun).toHaveBeenCalled();
    expect(afterRun).toHaveBeenCalled();
  });

  it("calls onError hook on failure", async () => {
    const onError = vi.fn();
    const runner = createCLIRunner({ hooks: { onError } });
    const cmd = createCommand({
      name: "fail",
      execute: () => {
        throw new Error("boom");
      },
    });
    await runner.run(cmd, createDummyContext());
    expect(onError).toHaveBeenCalled();
  });

  it("safeRun catches all errors", async () => {
    const runner = createCLIRunner();
    const cmd = createCommand({
      name: "fail",
      execute: () => {
        throw new Error("boom");
      },
    });
    const code = await runner.safeRun(cmd, createDummyContext());
    expect(code).toBe(CLI_EXIT_CODES.GENERAL_ERROR);
  });
});

describe("runCLICommand", () => {
  it("runs a command directly", async () => {
    let executed = false;
    const cmd = createCommand({
      name: "test",
      execute: () => {
        executed = true;
      },
    });
    const ctx = {
      args: [],
      values: {},
      cwd: "/tmp",
      env: {},
      logger: {
        debug: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
        trace: () => {},
        fatal: () => {},
        child: () => ({}) as any,
        level: 3,
        flush: () => {},
      } as any,
    };
    const code = await runCLICommand(cmd, ctx);
    expect(code).toBe(CLI_EXIT_CODES.SUCCESS);
    expect(executed).toBe(true);
  });
});

// ─── Help Generator ────────────────────────────────────────────────────────

describe("CLIHelpGenerator", () => {
  it("generates application help", () => {
    const generator = createHelpGenerator({ name: "my-app", version: "1.0.0" });
    const help = generator.generate([
      createCommand({
        name: "start",
        description: "Start the server",
        execute: () => {},
      }),
    ]);
    expect(help).toContain("my-app");
    expect(help).toContain("1.0.0");
    expect(help).toContain("start");
  });

  it("generates command help", () => {
    const generator = createHelpGenerator({ name: "my-app" });
    const help = generator.generateCommand(
      createCommand({
        name: "deploy",
        description: "Deploy to production",
        options: [
          { name: "env", type: "string", description: "Target environment" },
        ],
        execute: () => {},
      }),
    );
    expect(help).toContain("deploy");
    expect(help).toContain("Deploy to production");
    expect(help).toContain("--env");
  });

  it("generates help with aliases and arguments", () => {
    const generator = createHelpGenerator({ name: "app" });
    const help = generator.generateCommand(
      createCommand({
        name: "cp",
        aliases: ["copy"],
        arguments: [
          { name: "source", required: true },
          { name: "dest", required: true },
        ],
        execute: () => {},
      }),
    );
    expect(help).toContain("copy");
    expect(help).toContain("source");
    expect(help).toContain("dest");
  });
});

describe("generateCLIHelp", () => {
  it("generates help directly", () => {
    const help = generateCLIHelp(
      [createCommand({ name: "test", execute: () => {} })],
      { name: "app" },
    );
    expect(help).toContain("app");
    expect(help).toContain("test");
  });
});

describe("generateCommandHelp", () => {
  it("generates command help directly", () => {
    const help = generateCommandHelp(
      createCommand({
        name: "test",
        description: "Test command",
        execute: () => {},
      }),
      { name: "app" },
    );
    expect(help).toContain("test");
    expect(help).toContain("Test command");
  });
});

// ─── Help Formatter ────────────────────────────────────────────────────────

describe("formatTitle", () => {
  it("formats with version", () => {
    expect(formatTitle("app", "1.0.0")).toBe("app v1.0.0");
  });

  it("formats without version", () => {
    expect(formatTitle("app")).toBe("app");
  });
});

describe("formatCommands", () => {
  it("formats command list", () => {
    const output = formatCommands([
      createCommand({ name: "start", description: "Start", execute: () => {} }),
      createCommand({ name: "stop", description: "Stop", execute: () => {} }),
    ]);
    expect(output).toContain("start");
    expect(output).toContain("stop");
  });

  it("formats with aliases", () => {
    const output = formatCommands([
      createCommand({
        name: "start",
        aliases: ["-s"],
        description: "Start",
        execute: () => {},
      }),
    ]);
    expect(output).toContain("(-s)");
  });

  it("returns message for empty list", () => {
    expect(formatCommands([])).toContain("No commands");
  });
});

describe("formatOptions", () => {
  it("formats option list", () => {
    const output = formatOptions([
      { name: "verbose", type: "boolean", description: "Verbose output" },
      { name: "port", short: "p", type: "number", description: "Port" },
    ]);
    expect(output).toContain("--verbose");
    expect(output).toContain("-p, --port");
  });

  it("marks required options", () => {
    const output = formatOptions([{ name: "name", required: true }]);
    expect(output).toContain("[required]");
  });

  it("shows default values", () => {
    const output = formatOptions([{ name: "port", defaultValue: 3000 }]);
    expect(output).toContain("default: 3000");
  });
});

describe("formatArguments", () => {
  it("formats argument list", () => {
    const output = formatArguments([
      { name: "source", required: true },
      { name: "dest" },
    ]);
    expect(output).toContain("<source>");
    expect(output).toContain("<dest>");
  });

  it("marks variadic arguments", () => {
    const output = formatArguments([{ name: "files", variadic: true }]);
    expect(output).toContain("...");
  });
});

describe("formatAliases", () => {
  it("formats alias list", () => {
    const output = formatAliases(["-s", "--start"]);
    expect(output).toContain("-s");
    expect(output).toContain("--start");
  });
});

describe("formatOptionLabel", () => {
  it("formats long-only option", () => {
    const label = formatOptionLabel({ name: "verbose", type: "boolean" });
    expect(label).toBe("--verbose");
  });

  it("formats short + long option", () => {
    const label = formatOptionLabel({
      name: "port",
      short: "p",
      type: "number",
    });
    expect(label).toBe("-p, --port <number>");
  });
});

describe("formatArgumentLabel", () => {
  it("formats required argument", () => {
    expect(formatArgumentLabel({ name: "file" })).toBe("<file>");
  });

  it("formats variadic argument", () => {
    expect(formatArgumentLabel({ name: "files", variadic: true })).toBe(
      "<files...>",
    );
  });
});

describe("formatUsageSuffix", () => {
  it("formats with options", () => {
    const suffix = formatUsageSuffix(
      createCommand({
        name: "test",
        options: [{ name: "verbose" }],
        execute: () => {},
      }),
    );
    expect(suffix).toContain("[options]");
  });

  it("formats with arguments", () => {
    const suffix = formatUsageSuffix(
      createCommand({
        name: "test",
        arguments: [{ name: "file", required: true }],
        execute: () => {},
      }),
    );
    expect(suffix).toContain("<file>");
  });

  it("formats with subcommands", () => {
    const suffix = formatUsageSuffix(
      createCommand({
        name: "db",
        commands: [createCommand({ name: "migrate", execute: () => {} })],
        execute: () => {},
      }),
    );
    expect(suffix).toContain("<subcommand>");
  });
});

describe("formatGlobalOptions", () => {
  it("includes help and version", () => {
    const output = formatGlobalOptions();
    expect(output).toContain("--help");
    expect(output).toContain("--version");
  });
});

// ─── Version Utilities ─────────────────────────────────────────────────────

describe("getCLIVersion", () => {
  it("returns version info", () => {
    const info = getCLIVersion("my-app", "2.0.0");
    expect(info.name).toBe("my-app");
    expect(info.version).toBe("2.0.0");
    expect(info.formatted).toBe("my-app v2.0.0");
  });
});

describe("formatCLIVersion", () => {
  it("formats name and version", () => {
    expect(formatCLIVersion("app", "1.0.0")).toBe("app v1.0.0");
  });
});

describe("getVersionString", () => {
  it("returns the version string", () => {
    expect(getVersionString("3.0.0")).toBe("3.0.0");
  });

  it("returns default version when none given", () => {
    expect(getVersionString()).toBeTruthy();
  });
});

describe("isValidVersion", () => {
  it("accepts valid semver", () => {
    expect(isValidVersion("1.0.0")).toBe(true);
    expect(isValidVersion("2.1.3-beta.1")).toBe(true);
    expect(isValidVersion("1.0.0+build.123")).toBe(true);
  });

  it("rejects invalid versions", () => {
    expect(isValidVersion("v1.0.0")).toBe(false);
    expect(isValidVersion("1.0")).toBe(false);
    expect(isValidVersion("abc")).toBe(false);
    expect(isValidVersion("")).toBe(false);
  });
});

describe("parseVersion", () => {
  it("parses a valid version", () => {
    expect(parseVersion("1.2.3")).toEqual([1, 2, 3]);
  });

  it("parses version with prerelease", () => {
    expect(parseVersion("1.0.0-beta.1")).toEqual([1, 0, 0]);
  });

  it("throws for invalid version", () => {
    expect(() => parseVersion("abc")).toThrow(TypeError);
    expect(() => parseVersion("1.0")).toThrow(TypeError);
  });
});

describe("compareVersions", () => {
  it("returns 0 for equal versions", () => {
    expect(compareVersions("1.0.0", "1.0.0")).toBe(0);
  });

  it("returns 1 when first is greater", () => {
    expect(compareVersions("2.0.0", "1.0.0")).toBe(1);
    expect(compareVersions("1.1.0", "1.0.0")).toBe(1);
    expect(compareVersions("1.0.1", "1.0.0")).toBe(1);
  });

  it("returns -1 when first is less", () => {
    expect(compareVersions("1.0.0", "2.0.0")).toBe(-1);
    expect(compareVersions("1.0.0", "1.1.0")).toBe(-1);
  });
});

describe("isCompatibleVersion", () => {
  it("returns true when version >= minimum", () => {
    expect(isCompatibleVersion("2.0.0", "1.0.0")).toBe(true);
    expect(isCompatibleVersion("1.0.0", "1.0.0")).toBe(true);
  });

  it("returns false when version < minimum", () => {
    expect(isCompatibleVersion("0.9.0", "1.0.0")).toBe(false);
  });
});
