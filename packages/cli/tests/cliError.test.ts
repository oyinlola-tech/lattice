/**
 * zudo-cli — CLI Error Tests
 *
 * Tests for CLIError base class, command errors, argument errors,
 * option errors, and execution errors.
 */

import { describe, it, expect } from "vitest";
import {
  ApplicationError,
  NotFoundError,
  ConflictError,
  AuthorizationError,
  ConfigurationError,
} from "@zudolib/errors";

import {
  CLIError,
  isCLIError,
  normalizeCLIError,
  getCLIExitCode,
  getCLIErrorCode,
} from "../src/cliError/cliError.base.js";

import {
  CommandNotFoundError,
  DuplicateCommandError,
  InvalidCommandNameError,
} from "../src/cliError/cliError.command.js";

import {
  InvalidArgumentsError,
  MissingArgumentError,
} from "../src/cliError/cliError.argument.js";

import {
  InvalidOptionError,
  InvalidOptionNameError,
  MissingOptionValueError,
  DuplicateOptionError,
} from "../src/cliError/cliError.option.js";

import {
  CLIExecutionError,
  CLIPermissionError,
  CLIInterruptedError,
  CLIConfigurationError,
} from "../src/cliError/cliError.execution.js";

import {
  CLI_ERROR_CODES,
  CLI_EXIT_CODES,
} from "../src/cliConstant/cliConstant.value.js";

// ─── CLIError Base ─────────────────────────────────────────────────────────

describe("CLIError", () => {
  it("creates a CLI error with default options", () => {
    const error = new CLIError("test error");
    expect(error.message).toBe("test error");
    expect(error).toBeInstanceOf(CLIError);
    expect(error).toBeInstanceOf(ApplicationError);
    expect(error).toBeInstanceOf(Error);
  });

  it("has default exit code", () => {
    const error = new CLIError("test");
    expect(error.exitCode).toBe(CLI_EXIT_CODES.GENERAL_ERROR);
  });

  it("has default cliCode", () => {
    const error = new CLIError("test");
    expect(error.cliCode).toBe(CLI_ERROR_CODES.UNKNOWN_ERROR);
  });

  it("accepts custom options", () => {
    const error = new CLIError("custom", {
      code: CLI_ERROR_CODES.COMMAND_NOT_FOUND,
      exitCode: 3,
      command: "test-cmd",
      option: "--verbose",
      argument: "file",
      details: { foo: "bar" },
    });
    expect(error.cliCode).toBe(CLI_ERROR_CODES.COMMAND_NOT_FOUND);
    expect(error.exitCode).toBe(3);
    expect(error.command).toBe("test-cmd");
    expect(error.option).toBe("--verbose");
    expect(error.argument).toBe("file");
    expect(error.details).toEqual({ foo: "bar" });
  });

  it("serializes to JSON with CLI fields", () => {
    const error = new CLIError("json test", {
      command: "deploy",
      exitCode: 2,
    });
    const json = error.toJSON();
    expect(json.exitCode).toBe(2);
    expect(json.command).toBe("deploy");
    expect(json.message).toBe("json test");
  });

  it("omits undefined fields in toJSON", () => {
    const error = new CLIError("minimal");
    const json = error.toJSON();
    expect(json).not.toHaveProperty("command");
    expect(json).not.toHaveProperty("option");
    expect(json).not.toHaveProperty("argument");
    expect(json).not.toHaveProperty("details");
  });
});

describe("isCLIError", () => {
  it("returns true for CLIError instances", () => {
    expect(isCLIError(new CLIError("test"))).toBe(true);
  });

  it("returns true for CLIError subclasses", () => {
    expect(isCLIError(new CLIExecutionError())).toBe(true);
    expect(isCLIError(new InvalidArgumentsError())).toBe(true);
    expect(isCLIError(new InvalidOptionError("--x"))).toBe(true);
    // CommandNotFoundError extends NotFoundError, not CLIError
    expect(isCLIError(new CommandNotFoundError("cmd"))).toBe(false);
  });

  it("returns false for non-CLIError values", () => {
    expect(isCLIError(new Error("not cli"))).toBe(false);
    expect(isCLIError("string")).toBe(false);
    expect(isCLIError(null)).toBe(false);
    expect(isCLIError(undefined)).toBe(false);
    expect(isCLIError(42)).toBe(false);
  });
});

describe("normalizeCLIError", () => {
  it("returns CLIError unchanged", () => {
    const original = new CLIError("original");
    expect(normalizeCLIError(original)).toBe(original);
  });

  it("wraps Error into CLIError", () => {
    const wrapped = normalizeCLIError(new Error("plain error"));
    expect(wrapped).toBeInstanceOf(CLIError);
    expect(wrapped.message).toBe("plain error");
    expect(wrapped.cliCode).toBe(CLI_ERROR_CODES.UNKNOWN_ERROR);
  });

  it("wraps unknown values into CLIError", () => {
    const wrapped = normalizeCLIError("string error");
    expect(wrapped).toBeInstanceOf(CLIError);
    // Non-Error values use the fallback message
    expect(wrapped.message).toBeTruthy();
    expect(wrapped.cause).toBe("string error");
  });

  it("uses fallback message for empty errors", () => {
    const wrapped = normalizeCLIError(null, "custom fallback");
    expect(wrapped.message).toBe("custom fallback");
  });

  it("uses default fallback for undefined", () => {
    const wrapped = normalizeCLIError(undefined);
    expect(wrapped).toBeInstanceOf(CLIError);
    expect(wrapped.message).toBeTruthy();
  });
});

describe("getCLIExitCode", () => {
  it("extracts exit code from CLIError", () => {
    const error = new CLIError("test", { exitCode: 42 });
    expect(getCLIExitCode(error)).toBe(42);
  });

  it("returns GENERAL_ERROR for non-CLIError", () => {
    expect(getCLIExitCode(new Error("test"))).toBe(
      CLI_EXIT_CODES.GENERAL_ERROR,
    );
    expect(getCLIExitCode("string")).toBe(CLI_EXIT_CODES.GENERAL_ERROR);
  });
});

describe("getCLIErrorCode", () => {
  it("extracts error code from CLIError", () => {
    const error = new CLIError("test", {
      code: CLI_ERROR_CODES.COMMAND_NOT_FOUND,
    });
    expect(getCLIErrorCode(error)).toBe(CLI_ERROR_CODES.COMMAND_NOT_FOUND);
  });

  it("returns UNKNOWN_ERROR for non-CLIError", () => {
    expect(getCLIErrorCode(new Error("test"))).toBe(
      CLI_ERROR_CODES.UNKNOWN_ERROR,
    );
  });
});

// ─── Command Errors ────────────────────────────────────────────────────────

describe("CommandNotFoundError", () => {
  it("extends NotFoundError from @zudolib/errors", () => {
    const error = new CommandNotFoundError("deploy");
    expect(error).toBeInstanceOf(NotFoundError);
    expect(error).toBeInstanceOf(Error);
  });

  it("has the command in the message", () => {
    const error = new CommandNotFoundError("deploy");
    expect(error.message).toContain("deploy");
  });

  it("has exit code COMMAND_NOT_FOUND", () => {
    const error = new CommandNotFoundError("deploy");
    expect(error.exitCode).toBe(CLI_EXIT_CODES.COMMAND_NOT_FOUND);
  });

  it("serializes with exit code", () => {
    const error = new CommandNotFoundError("deploy");
    const json = error.toJSON();
    expect(json.exitCode).toBe(CLI_EXIT_CODES.COMMAND_NOT_FOUND);
  });
});

describe("DuplicateCommandError", () => {
  it("extends ConflictError from @zudolib/errors", () => {
    const error = new DuplicateCommandError("deploy");
    expect(error).toBeInstanceOf(ConflictError);
  });

  it("has the command in the message", () => {
    const error = new DuplicateCommandError("deploy");
    expect(error.message).toContain("deploy");
  });
});

describe("InvalidCommandNameError", () => {
  it("extends NotFoundError from @zudolib/errors", () => {
    const error = new InvalidCommandNameError("");
    expect(error).toBeInstanceOf(NotFoundError);
  });

  it("has the name in the message", () => {
    const error = new InvalidCommandNameError("bad-name!");
    expect(error.message).toContain("bad-name!");
  });
});

// ─── Argument Errors ───────────────────────────────────────────────────────

describe("InvalidArgumentsError", () => {
  it("extends CLIError", () => {
    const error = new InvalidArgumentsError("bad args");
    expect(error).toBeInstanceOf(CLIError);
  });

  it("has default message", () => {
    const error = new InvalidArgumentsError();
    expect(error.message).toBeTruthy();
  });

  it("has INVALID_ARGUMENTS exit code", () => {
    const error = new InvalidArgumentsError();
    expect(error.exitCode).toBe(CLI_EXIT_CODES.INVALID_ARGUMENTS);
  });
});

describe("MissingArgumentError", () => {
  it("extends CLIError", () => {
    const error = new MissingArgumentError("file");
    expect(error).toBeInstanceOf(CLIError);
  });

  it("includes argument name in message", () => {
    const error = new MissingArgumentError("file");
    expect(error.message).toContain("file");
  });

  it("includes command context when provided", () => {
    const error = new MissingArgumentError("file", "open");
    expect(error.command).toBe("open");
    expect(error.argument).toBe("file");
  });
});

// ─── Option Errors ─────────────────────────────────────────────────────────

describe("InvalidOptionError", () => {
  it("extends CLIError", () => {
    const error = new InvalidOptionError("--unknown");
    expect(error).toBeInstanceOf(CLIError);
  });

  it("includes option name in message", () => {
    const error = new InvalidOptionError("--verbose");
    expect(error.message).toContain("--verbose");
  });
});

describe("InvalidOptionNameError", () => {
  it("extends CLIError", () => {
    const error = new InvalidOptionNameError("bad!option");
    expect(error).toBeInstanceOf(CLIError);
  });
});

describe("MissingOptionValueError", () => {
  it("extends CLIError", () => {
    const error = new MissingOptionValueError("--port");
    expect(error).toBeInstanceOf(CLIError);
  });

  it("includes option in message", () => {
    const error = new MissingOptionValueError("--port");
    expect(error.message).toContain("--port");
  });
});

describe("DuplicateOptionError", () => {
  it("extends ConflictError from @zudolib/errors", () => {
    const error = new DuplicateOptionError("--verbose");
    expect(error).toBeInstanceOf(ConflictError);
  });

  it("includes option in message", () => {
    const error = new DuplicateOptionError("--verbose");
    expect(error.message).toContain("--verbose");
  });
});

// ─── Execution Errors ──────────────────────────────────────────────────────

describe("CLIExecutionError", () => {
  it("extends CLIError", () => {
    const error = new CLIExecutionError("exec failed");
    expect(error).toBeInstanceOf(CLIError);
  });

  it("has default message", () => {
    const error = new CLIExecutionError();
    expect(error.message).toBeTruthy();
  });

  it("is not exposed", () => {
    const error = new CLIExecutionError("secret");
    const json = error.toJSON();
    expect(json.expose).toBe(false);
  });
});

describe("CLIPermissionError", () => {
  it("extends AuthorizationError from @zudolib/errors", () => {
    const error = new CLIPermissionError();
    expect(error).toBeInstanceOf(AuthorizationError);
  });

  it("has PERMISSION_DENIED exit code", () => {
    const error = new CLIPermissionError();
    expect(error.exitCode).toBe(CLI_EXIT_CODES.PERMISSION_DENIED);
  });
});

describe("CLIInterruptedError", () => {
  it("extends CLIError", () => {
    const error = new CLIInterruptedError();
    expect(error).toBeInstanceOf(CLIError);
  });

  it("has INTERRUPTED exit code (130)", () => {
    const error = new CLIInterruptedError();
    expect(error.exitCode).toBe(CLI_EXIT_CODES.INTERRUPTED);
  });
});

describe("CLIConfigurationError", () => {
  it("extends ConfigurationError from @zudolib/errors", () => {
    const error = new CLIConfigurationError();
    expect(error).toBeInstanceOf(ConfigurationError);
  });

  it("has GENERAL_ERROR exit code", () => {
    const error = new CLIConfigurationError();
    expect(error.exitCode).toBe(CLI_EXIT_CODES.GENERAL_ERROR);
  });
});
