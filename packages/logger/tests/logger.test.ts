import { describe, it, expect, vi } from "vitest";
import {
  createLogger,
  LoggerLevel,
  createConsoleLoggerTransport,
  createJsonLoggerFormatter,
  createTextLoggerFormatter,
  createCompactLoggerFormatter,
  createLoggerFactory,
  createLoggerManager,
  loggerLevelToName,
  loggerLevelFromName,
  shouldLog,
  getLoggerLevels,
  getLoggerLevelNames,
  isLoggerLevel,
  isLoggerLevelName,
  createLoggerContext,
  isLoggerContext,
} from "../src/index.js";

describe("LoggerLevel utilities", () => {
  it("should convert level to name", () => {
    expect(loggerLevelToName(LoggerLevel.FATAL)).toBe("fatal");
    expect(loggerLevelToName(LoggerLevel.ERROR)).toBe("error");
    expect(loggerLevelToName(LoggerLevel.WARN)).toBe("warn");
    expect(loggerLevelToName(LoggerLevel.INFO)).toBe("info");
    expect(loggerLevelToName(LoggerLevel.DEBUG)).toBe("debug");
    expect(loggerLevelToName(LoggerLevel.TRACE)).toBe("trace");
  });

  it("should convert name to level", () => {
    expect(loggerLevelFromName("fatal")).toBe(LoggerLevel.FATAL);
    expect(loggerLevelFromName("error")).toBe(LoggerLevel.ERROR);
    expect(loggerLevelFromName("warn")).toBe(LoggerLevel.WARN);
    expect(loggerLevelFromName("info")).toBe(LoggerLevel.INFO);
    expect(loggerLevelFromName("debug")).toBe(LoggerLevel.DEBUG);
    expect(loggerLevelFromName("trace")).toBe(LoggerLevel.TRACE);
  });

  it("should handle alias 'warning' for warn", () => {
    expect(loggerLevelFromName("warning")).toBe(LoggerLevel.WARN);
  });

  it("should determine if level should be logged", () => {
    expect(shouldLog(LoggerLevel.INFO, LoggerLevel.ERROR)).toBe(true);
    expect(shouldLog(LoggerLevel.INFO, LoggerLevel.DEBUG)).toBe(false);
    expect(shouldLog(LoggerLevel.DEBUG, LoggerLevel.DEBUG)).toBe(true);
    expect(shouldLog(LoggerLevel.FATAL, LoggerLevel.FATAL)).toBe(true);
  });

  it("should return all levels", () => {
    const levels = getLoggerLevels();
    expect(levels).toHaveLength(6);
    expect(levels).toContain(LoggerLevel.FATAL);
  });

  it("should return all level names", () => {
    const names = getLoggerLevelNames();
    expect(names).toHaveLength(6);
    expect(names).toContain("fatal");
    expect(names).toContain("info");
  });

  it("should validate level values", () => {
    expect(isLoggerLevel(LoggerLevel.INFO)).toBe(true);
    expect(isLoggerLevel(999)).toBe(false);
  });

  it("should validate level names", () => {
    expect(isLoggerLevelName("info")).toBe(true);
    expect(isLoggerLevelName("invalid")).toBe(false);
  });
});

describe("createLogger", () => {
  it("should create a logger with defaults", () => {
    const logger = createLogger();
    expect(logger.name).toBe("zudojs");
    expect(logger.level).toBe(LoggerLevel.INFO);
    expect(logger.enabled).toBe(true);
  });

  it("should create a logger with custom options", () => {
    const logger = createLogger({
      name: "test",
      level: LoggerLevel.DEBUG,
    });
    expect(logger.name).toBe("test");
    expect(logger.level).toBe(LoggerLevel.DEBUG);
  });

  it("should log at different levels", () => {
    const logger = createLogger({ name: "test" });
    expect(() => logger.fatal("fatal")).not.toThrow();
    expect(() => logger.error("error")).not.toThrow();
    expect(() => logger.warn("warn")).not.toThrow();
    expect(() => logger.info("info")).not.toThrow();
    expect(() => logger.debug("debug")).not.toThrow();
    expect(() => logger.trace("trace")).not.toThrow();
  });

  it("should create child loggers", () => {
    const parent = createLogger({ name: "parent" });
    const child = parent.child({ name: "child" });
    expect(child.name).toBe("child");
  });

  it("should enable and disable", () => {
    const logger = createLogger({ name: "test" });
    logger.disable();
    expect(logger.enabled).toBe(false);
    logger.enable();
    expect(logger.enabled).toBe(true);
  });

  it("should change log level", () => {
    const logger = createLogger({ name: "test" });
    logger.setLevel(LoggerLevel.DEBUG);
    expect(logger.level).toBe(LoggerLevel.DEBUG);
  });

  it("should flush and close without error", async () => {
    const logger = createLogger({ name: "test" });
    await expect(logger.flush()).resolves.toBeUndefined();
    await expect(logger.close()).resolves.toBeUndefined();
  });
});

describe("Formatters", () => {
  it("should create text formatter", () => {
    const formatter = createTextLoggerFormatter();
    expect(formatter).toBeDefined();
  });

  it("should create JSON formatter", () => {
    const formatter = createJsonLoggerFormatter();
    expect(formatter).toBeDefined();
  });

  it("should create compact formatter", () => {
    const formatter = createCompactLoggerFormatter();
    expect(formatter).toBeDefined();
  });
});

describe("Transports", () => {
  it("should create console transport", () => {
    const transport = createConsoleLoggerTransport();
    expect(transport).toBeDefined();
    expect(transport.name).toBeDefined();
  });

  it("should create logger with custom transport", () => {
    const written: unknown[] = [];
    const transport = {
      name: "test",
      enabled: true,
      write: (entry: unknown) => {
        written.push(entry);
      },
    };

    const logger = createLogger({
      name: "test",
      transports: [transport],
    });

    logger.info("test message");
    expect(written.length).toBeGreaterThan(0);
  });
});

describe("LoggerFactory", () => {
  it("should create a factory", () => {
    const factory = createLoggerFactory();
    expect(factory).toBeDefined();
    expect(factory.size).toBe(0);
  });

  it("should create and retrieve loggers", () => {
    const factory = createLoggerFactory();
    const logger = factory.create("test");
    expect(factory.has("test")).toBe(true);
    expect(factory.get("test")).toBe(logger);
  });

  it("should create child loggers", () => {
    const factory = createLoggerFactory();
    const parent = factory.create("parent");
    const child = factory.child(parent, { name: "child" });
    expect(child.name).toBe("child");
  });

  it("should remove loggers", () => {
    const factory = createLoggerFactory();
    factory.create("test");
    expect(factory.remove("test")).toBe(true);
    expect(factory.has("test")).toBe(false);
  });

  it("should create transient loggers", () => {
    const factory = createLoggerFactory();
    const logger = factory.createTransient({ name: "transient" });
    expect(logger.name).toBe("transient");
  });
});

describe("LoggerManager", () => {
  it("should create a manager", () => {
    const manager = createLoggerManager();
    expect(manager).toBeDefined();
    expect(manager.isInitialized).toBe(false);
  });

  it("should initialize with a logger", () => {
    const manager = createLoggerManager();
    manager.initialize({ name: "app" });
    expect(manager.isInitialized).toBe(true);
    expect(manager.getLogger()).toBeDefined();
  });

  it("should create and retrieve named loggers", () => {
    const manager = createLoggerManager();
    manager.initialize({ name: "app" });
    const logger = manager.create("service");
    expect(manager.has("service")).toBe(true);
    expect(manager.get("service")).toBe(logger);
  });

  it("should flush and close", async () => {
    const manager = createLoggerManager();
    manager.initialize({ name: "app" });
    await manager.flush();
    await manager.close();
    expect(manager.isClosed).toBe(true);
  });
});

describe("LoggerContext", () => {
  it("should create a logger context", () => {
    const ctx = createLoggerContext({
      correlationId: "corr-123",
      metadata: { userId: "user-1" },
    });
    expect(ctx.identifiers.correlationId).toBe("corr-123");
    expect(ctx.metadata.userId).toBe("user-1");
  });

  it("should create a context with defaults", () => {
    const ctx = createLoggerContext();
    expect(ctx.identifiers).toEqual({});
    expect(ctx.metadata).toEqual({});
  });

  it("should merge contexts via parent", () => {
    const ctx1 = createLoggerContext({
      correlationId: "c1",
      metadata: { a: 1 },
    });
    const ctx2 = createLoggerContext({
      parent: ctx1,
      requestId: "r1",
      metadata: { b: 2 },
    });

    expect(ctx2.identifiers.correlationId).toBe("c1");
    expect(ctx2.identifiers.requestId).toBe("r1");
    expect(ctx2.metadata.a).toBe(1);
    expect(ctx2.metadata.b).toBe(2);
  });

  it("should validate context", () => {
    expect(isLoggerContext(createLoggerContext({}))).toBe(true);
    expect(isLoggerContext({})).toBe(false);
  });
});
