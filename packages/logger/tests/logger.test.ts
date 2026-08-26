import { describe, it, expect } from "vitest";

import {
  LoggerLevel,
  loggerLevelToName,
  loggerLevelFromName,
  shouldLog,
  getLoggerLevels,
  getLoggerLevelNames,
} from "../src/logger-level.js";

import {
  createLoggerEntry,
  createErrorLoggerEntry,
  serializeLoggerEntry,
} from "../src/logger-entry.js";

import {
  createLoggerContext,
  createEmptyLoggerContext,
  mergeLoggerContexts,
  isLoggerContext,
} from "../src/logger-context.js";

import {
  createJsonLoggerFormatter,
  createTextLoggerFormatter,
  createCompactLoggerFormatter,
} from "../src/logger-formatter.js";

import {
  createConsoleLoggerTransport,
  createMultiLoggerTransport,
  createConditionalLoggerTransport,
} from "../src/logger-transport.js";

import {
  LoggerError,
  LoggerConfigurationError,
  LoggerDisposedError,
  isLoggerError,
  toLoggerError,
} from "../src/logger-error.js";

import {
  validateLoggerOptions,
  DEFAULT_LOGGER_OPTIONS,
} from "../src/logger-options.js";

// ---------------------------------------------------------------------------
// LoggerLevel
// ---------------------------------------------------------------------------

describe("LoggerLevel", () => {
  it("has 6 levels", () => {
    const names = getLoggerLevelNames();
    expect(names).toHaveLength(6);
  });

  it("converts level to name", () => {
    expect(loggerLevelToName(LoggerLevel.DEBUG)).toBe(
      "debug",
    );
    expect(loggerLevelToName(LoggerLevel.INFO)).toBe(
      "info",
    );
    expect(loggerLevelToName(LoggerLevel.WARN)).toBe(
      "warn",
    );
    expect(loggerLevelToName(LoggerLevel.ERROR)).toBe(
      "error",
    );
    expect(loggerLevelToName(LoggerLevel.FATAL)).toBe(
      "fatal",
    );
    expect(loggerLevelToName(LoggerLevel.TRACE)).toBe(
      "trace",
    );
  });

  it("converts name to level", () => {
    expect(loggerLevelFromName("debug")).toBe(
      LoggerLevel.DEBUG,
    );
    expect(loggerLevelFromName("info")).toBe(
      LoggerLevel.INFO,
    );
  });

  it("shouldLog respects level hierarchy", () => {
    // FATAL=0, ERROR=1, WARN=2, INFO=3, DEBUG=4, TRACE=5
    // shouldLog(threshold, messageLevel) = messageLevel <= threshold
    // threshold=INFO(3) allows FATAL(0), ERROR(1), WARN(2), INFO(3)
    expect(shouldLog(LoggerLevel.INFO, LoggerLevel.ERROR)).toBe(true);
    expect(shouldLog(LoggerLevel.INFO, LoggerLevel.WARN)).toBe(true);
    expect(shouldLog(LoggerLevel.INFO, LoggerLevel.DEBUG)).toBe(false);
    expect(shouldLog(LoggerLevel.DEBUG, LoggerLevel.INFO)).toBe(true);
    expect(shouldLog(LoggerLevel.WARN, LoggerLevel.ERROR)).toBe(true);
    expect(shouldLog(LoggerLevel.WARN, LoggerLevel.INFO)).toBe(false);
  });

  it("shouldLog allows same level", () => {
    expect(shouldLog(LoggerLevel.INFO, LoggerLevel.INFO)).toBe(true);
  });

  it("getLoggerLevels returns all levels", () => {
    const levels = getLoggerLevels();
    expect(levels).toHaveLength(6);
    expect(levels).toContain(LoggerLevel.FATAL);
    expect(levels).toContain(LoggerLevel.TRACE);
  });
});

// ---------------------------------------------------------------------------
// LoggerEntry
// ---------------------------------------------------------------------------

describe("LoggerEntry", () => {
  it("creates a log entry", () => {
    const entry = createLoggerEntry({
      level: LoggerLevel.INFO,
      message: "test message",
    });

    expect(entry.level).toBe(LoggerLevel.INFO);
    expect(entry.levelName).toBe("info");
    expect(entry.message).toBe("test message");
    expect(entry.id).toBeTruthy();
    expect(entry.timestamp).toBeInstanceOf(Date);
  });

  it("creates an error log entry", () => {
    const error = new Error("boom");
    const entry = createErrorLoggerEntry(
      error,
      LoggerLevel.ERROR,
    );

    expect(entry.level).toBe(LoggerLevel.ERROR);
    expect(entry.error).toBe(error);
    expect(entry.message).toContain("boom");
  });

  it("serializes an entry to a plain object", () => {
    const entry = createLoggerEntry({
      level: LoggerLevel.WARN,
      message: "warning",
    });

    const obj = serializeLoggerEntry(entry);
    expect(typeof obj).toBe("object");
    expect(obj.level).toBe(LoggerLevel.WARN);
    expect(obj.message).toBe("warning");
  });
});

// ---------------------------------------------------------------------------
// LoggerContext
// ---------------------------------------------------------------------------

describe("LoggerContext", () => {
  it("creates a logger context", () => {
    const ctx = createLoggerContext({
      correlationId: "corr-1",
      requestId: "req-1",
    });

    expect(ctx.correlationId).toBe("corr-1");
    expect(ctx.requestId).toBe("req-1");
    expect(isLoggerContext(ctx)).toBe(true);
  });

  it("creates an empty context", () => {
    const ctx = createEmptyLoggerContext();
    expect(isLoggerContext(ctx)).toBe(true);
    expect(ctx.correlationId).toBeUndefined();
  });

  it("merges contexts", () => {
    const base = createLoggerContext({
      correlationId: "c1",
    });
    const override = createLoggerContext({
      requestId: "r1",
    });

    const merged = mergeLoggerContexts(base, override);
    expect(merged.correlationId).toBe("c1");
    expect(merged.requestId).toBe("r1");
  });

  it("override replaces base values", () => {
    const base = createLoggerContext({
      correlationId: "c1",
    });
    const override = createLoggerContext({
      correlationId: "c2",
    });

    const merged = mergeLoggerContexts(base, override);
    expect(merged.correlationId).toBe("c2");
  });
});

// ---------------------------------------------------------------------------
// LoggerFormatters
// ---------------------------------------------------------------------------

describe("LoggerFormatters", () => {
  const entry = createLoggerEntry({
    level: LoggerLevel.INFO,
    message: "hello world",
  });

  it("formats as JSON", () => {
    const formatter = createJsonLoggerFormatter();
    const output = formatter.format(entry, {});
    expect(typeof output).toBe("string");
    const parsed = JSON.parse(output);
    expect(parsed.message).toBe("hello world");
  });

  it("formats as text", () => {
    const formatter = createTextLoggerFormatter();
    const output = formatter.format(entry, {});
    expect(typeof output).toBe("string");
    expect(output).toContain("hello world");
  });

  it("formats as compact", () => {
    const formatter = createCompactLoggerFormatter();
    const output = formatter.format(entry, {});
    expect(typeof output).toBe("string");
  });
});

// ---------------------------------------------------------------------------
// LoggerTransports
// ---------------------------------------------------------------------------

describe("LoggerTransports", () => {
  it("creates a console transport with id", () => {
    const transport = createConsoleLoggerTransport();
    expect(transport.id).toBeTruthy();
    expect(typeof transport.write).toBe("function");
  });

  it("creates a multi-transport with id", () => {
    const t1 = createConsoleLoggerTransport();
    const t2 = createConsoleLoggerTransport();
    const multi = createMultiLoggerTransport([t1, t2]);
    expect(multi.id).toBeTruthy();
  });

  it("creates a conditional transport", () => {
    const transport = createConditionalLoggerTransport({
      predicate: () => true,
      transport: createConsoleLoggerTransport(),
    });
    expect(typeof transport.write).toBe("function");
  });
});

// ---------------------------------------------------------------------------
// LoggerError
// ---------------------------------------------------------------------------

describe("LoggerError", () => {
  it("is an error", () => {
    const err = new LoggerError("test error");
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("test error");
    expect(isLoggerError(err)).toBe(true);
  });

  it("LoggerConfigurationError extends LoggerError", () => {
    const err = new LoggerConfigurationError("bad config");
    expect(err).toBeInstanceOf(LoggerError);
    expect(err).toBeInstanceOf(Error);
  });

  it("LoggerDisposedError extends LoggerError", () => {
    const err = new LoggerDisposedError();
    expect(err).toBeInstanceOf(LoggerError);
  });

  it("toLoggerError wraps unknown errors", () => {
    const err = toLoggerError("string error");
    expect(err).toBeInstanceOf(Error);
    expect(err.message).toBe("string error");
  });

  it("toLoggerError passes through LoggerError", () => {
    const original = new LoggerError("original");
    const wrapped = toLoggerError(original);
    expect(wrapped).toBe(original);
  });

  it("isLoggerError rejects non-errors", () => {
    expect(isLoggerError("string")).toBe(false);
    expect(isLoggerError(null)).toBe(false);
    expect(isLoggerError(42)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// LoggerOptions validation
// ---------------------------------------------------------------------------

describe("LoggerOptions", () => {
  it("validates empty options", () => {
    expect(() => validateLoggerOptions({})).not.toThrow();
  });

  it("rejects empty name", () => {
    expect(() =>
      validateLoggerOptions({ name: "" }),
    ).toThrow();
  });

  it("rejects negative transportTimeout", () => {
    expect(() =>
      validateLoggerOptions({ transportTimeout: -1 }),
    ).toThrow();
  });

  it("has sensible defaults", () => {
    expect(DEFAULT_LOGGER_OPTIONS.enabled).toBe(true);
    expect(DEFAULT_LOGGER_OPTIONS.asynchronous).toBe(false);
    expect(DEFAULT_LOGGER_OPTIONS.transportTimeout).toBe(10_000);
  });
});
