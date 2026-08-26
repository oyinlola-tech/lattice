import { describe, it, expect } from "vitest";
import { Container } from "../src/container/container.js";
import { createToken, type Token } from "../src/container/token.js";
import {
  ProviderNotFoundError,
  ProviderAlreadyRegisteredError,
} from "../src/errors/exceptions.js";

// ─── Test tokens ────────────────────────────────────────

const LoggerToken = createToken<Logger>("Logger");
const DatabaseToken = createToken<Database>("Database");
const ConfigToken = createToken<Config>("Config");

interface Logger {
  log(message: string): void;
}

interface Database {
  query(sql: string): unknown[];
}

interface Config {
  host: string;
  port: number;
}

// ─── Test implementations ──────────────────────────────

class ConsoleLogger implements Logger {
  public messages: string[] = [];

  public log(message: string): void {
    this.messages.push(message);
  }
}

class PostgresDatabase implements Database {
  public query(sql: string): unknown[] {
    return [{ sql }];
  }
}

// ─── Tests ──────────────────────────────────────────────

describe("Container", () => {
  describe("register and resolve", () => {
    it("should register and resolve a value provider", () => {
      const container = new Container();
      const config: Config = { host: "localhost", port: 5432 };

      container.register(ConfigToken, { useValue: config });

      const resolved = container.resolve(ConfigToken);

      expect(resolved).toBe(config);
      expect(resolved.host).toBe("localhost");
      expect(resolved.port).toBe(5432);
    });

    it("should register and resolve a class provider", () => {
      const container = new Container();

      container.register(LoggerToken, { useClass: ConsoleLogger });

      const logger = container.resolve(LoggerToken);

      expect(logger).toBeInstanceOf(ConsoleLogger);
      logger.log("hello");
      expect(logger.messages).toEqual(["hello"]);
    });

    it("should register and resolve a factory provider", () => {
      const container = new Container();

      container.register(DatabaseToken, {
        useFactory: (c) => {
          // Factory receives the container for nested resolution
          return new PostgresDatabase();
        },
      });

      const db = container.resolve(DatabaseToken);

      expect(db).toBeInstanceOf(PostgresDatabase);
      expect(db.query("SELECT 1")).toEqual([{ sql: "SELECT 1" }]);
    });

    it("should return the same instance for singleton scope", () => {
      const container = new Container();

      container.register(LoggerToken, { useClass: ConsoleLogger });

      const first = container.resolve(LoggerToken);
      const second = container.resolve(LoggerToken);

      expect(first).toBe(second);
    });

    it("should return different instances for transient scope", () => {
      const container = new Container();

      container.register(
        LoggerToken,
        { useClass: ConsoleLogger },
        "transient",
      );

      const first = container.resolve(LoggerToken);
      const second = container.resolve(LoggerToken);

      expect(first).not.toBe(second);
      expect(first).toBeInstanceOf(ConsoleLogger);
      expect(second).toBeInstanceOf(ConsoleLogger);
    });
  });

  describe("error handling", () => {
    it("should throw ProviderNotFoundError for unregistered token", () => {
      const container = new Container();

      expect(() => container.resolve(LoggerToken)).toThrow(
        ProviderNotFoundError,
      );
    });

    it("should throw ProviderAlreadyRegisteredError for duplicate registration", () => {
      const container = new Container();

      container.register(LoggerToken, { useClass: ConsoleLogger });

      expect(() =>
        container.register(LoggerToken, { useClass: ConsoleLogger }),
      ).toThrow(ProviderAlreadyRegisteredError);
    });

    it("should provide descriptive error message for missing provider", () => {
      const container = new Container();

      try {
        container.resolve(LoggerToken);
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderNotFoundError);
        expect((error as Error).message).toContain("Logger");
      }
    });

    it("should provide descriptive error message for duplicate provider", () => {
      const container = new Container();

      container.register(LoggerToken, { useClass: ConsoleLogger });

      try {
        container.register(LoggerToken, { useClass: ConsoleLogger });
        expect.fail("Should have thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(ProviderAlreadyRegisteredError);
        expect((error as Error).message).toContain("Logger");
      }
    });
  });

  describe("has and unregister", () => {
    it("should return true for registered token", () => {
      const container = new Container();

      container.register(LoggerToken, { useClass: ConsoleLogger });

      expect(container.has(LoggerToken)).toBe(true);
    });

    it("should return false for unregistered token", () => {
      const container = new Container();

      expect(container.has(LoggerToken)).toBe(false);
    });

    it("should unregister a token", () => {
      const container = new Container();

      container.register(LoggerToken, { useClass: ConsoleLogger });
      expect(container.has(LoggerToken)).toBe(true);

      const removed = container.unregister(LoggerToken);
      expect(removed).toBe(true);
      expect(container.has(LoggerToken)).toBe(false);
    });

    it("should return false when unregistering non-existent token", () => {
      const container = new Container();

      const removed = container.unregister(LoggerToken);
      expect(removed).toBe(false);
    });
  });

  describe("clear", () => {
    it("should clear all registrations", () => {
      const container = new Container();

      container.register(LoggerToken, { useClass: ConsoleLogger });
      container.register(DatabaseToken, {
        useClass: PostgresDatabase,
      });

      expect(container.has(LoggerToken)).toBe(true);
      expect(container.has(DatabaseToken)).toBe(true);

      container.clear();

      expect(container.has(LoggerToken)).toBe(false);
      expect(container.has(DatabaseToken)).toBe(false);
    });
  });

  describe("token types", () => {
    it("should work with string tokens", () => {
      const container = new Container();
      const StringToken = createToken<string>("StringValue");

      container.register(StringToken, { useValue: "hello" });

      expect(container.resolve(StringToken)).toBe("hello");
    });

    it("should work with symbol tokens", () => {
      const container = new Container();
      const SymbolToken = Symbol("SymbolValue");

      container.register(SymbolToken, { useValue: 42 });

      expect(container.resolve(SymbolToken)).toBe(42);
    });

    it("should work with class tokens", () => {
      const container = new Container();

      container.register(ConsoleLogger, {
        useClass: ConsoleLogger,
      });

      const logger = container.resolve(ConsoleLogger);
      expect(logger).toBeInstanceOf(ConsoleLogger);
    });
  });

  describe("nested resolution", () => {
    it("should resolve factory dependencies through the container", () => {
      const container = new Container();

      container.register(ConfigToken, {
        useValue: { host: "localhost", port: 5432 },
      });

      container.register(DatabaseToken, {
        useFactory: (c) => {
          const config = c.resolve(ConfigToken);
          return new PostgresDatabase();
        },
      });

      const db = container.resolve(DatabaseToken);
      expect(db).toBeInstanceOf(PostgresDatabase);
    });
  });
});
