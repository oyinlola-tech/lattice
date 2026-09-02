import { describe, it, expect } from "vitest";
import { createContainer, createToken } from "../src/index.js";

const LOGGER = createToken<{ log: (m: string) => void }>("logger");
const DB = createToken<{ query: () => string }>("db");
const API = createToken<{ get: (id: string) => string }>("api");
const NOT_REGISTERED = createToken<unknown>("missing");

describe("Container", () => {
  describe("createContainer", () => {
    it("creates a container with default options", () => {
      const c = createContainer();
      expect(c).toBeDefined();
      expect(c.disposed).toBe(false);
    });

    it("accepts custom options", () => {
      const c = createContainer({ name: "my-container" });
      expect(c.options.name).toBe("my-container");
    });
  });

  describe("registerValue", () => {
    it("registers and resolves a value", () => {
      const c = createContainer();
      const logger = { log: () => {} };
      c.registerValue(LOGGER, logger);
      expect(c.resolve(LOGGER)).toBe(logger);
    });

    it("can register a class instance as a value", () => {
      const c = createContainer();
      class Logger {
        log(): void {}
      }
      const instance = new Logger();
      c.registerValue(LOGGER, instance);
      expect(c.resolve(LOGGER)).toBe(instance);
    });
  });

  describe("registerClass", () => {
    it("instantiates a class on first resolution", () => {
      const c = createContainer();
      class Db {
        query(): string {
          return "ok";
        }
      }
      c.registerClass(DB, Db);
      const db = c.resolve(DB);
      expect(db).toBeInstanceOf(Db);
      expect(db.query()).toBe("ok");
    });
  });

  describe("registerFactory", () => {
    it("invokes the factory each time", () => {
      const c = createContainer();
      let n = 0;
      c.registerFactory(API, () => {
        n++;
        return { get: (id: string) => id };
      });
      c.resolve(API);
      c.resolve(API);
      expect(n).toBe(2);
    });
  });

  describe("has / canResolve", () => {
    it("has() returns true for registered tokens", () => {
      const c = createContainer();
      c.registerValue(LOGGER, { log: () => {} });
      expect(c.has(LOGGER)).toBe(true);
      expect(c.has(NOT_REGISTERED)).toBe(false);
    });

    it("canResolve returns false for unregistered", () => {
      const c = createContainer();
      expect(c.canResolve(NOT_REGISTERED)).toBe(false);
    });
  });

  describe("resolveOptional", () => {
    it("returns undefined for unregistered tokens", () => {
      const c = createContainer();
      expect(c.resolveOptional(NOT_REGISTERED)).toBeUndefined();
    });

    it("returns the value for registered tokens", () => {
      const c = createContainer();
      c.registerValue(LOGGER, { log: () => {} });
      expect(c.resolveOptional(LOGGER)).toBeDefined();
    });
  });

  describe("resolveMany", () => {
    it("resolves multiple tokens at once", () => {
      const c = createContainer();
      c.registerValue(LOGGER, { log: () => {} });
      c.registerValue(DB, { query: () => "ok" });
      const [logger, db] = c.resolveMany([LOGGER, DB]);
      expect(logger).toBeDefined();
      expect(db).toBeDefined();
    });
  });

  describe("dispose", () => {
    it("marks the container as disposed", async () => {
      const c = createContainer();
      await c.dispose();
      expect(c.disposed).toBe(true);
    });
  });
});

describe("createToken()", () => {
  it("creates a token with a description", () => {
    const t = createToken<number>("counter");
    expect(t.description).toBe("counter");
  });
});
