import { describe, it, expect } from "vitest";
import {
  parsePermission,
  isValidPermission,
  matches,
  matchesPermission,
  createPermissionRegistry,
} from "../src/index.js";

describe("parsePermission", () => {
  it("parses a simple permission", () => {
    const perm = parsePermission("post:update");
    expect(perm).toEqual({ resource: "post", action: "update" });
  });

  it("parses a namespaced permission", () => {
    const perm = parsePermission("billing.invoice:refund");
    expect(perm).toEqual({ resource: "billing.invoice", action: "refund" });
  });

  it("parses wildcard action", () => {
    const perm = parsePermission("post:*");
    expect(perm).toEqual({ resource: "post", action: "*" });
  });

  it("parses global wildcard", () => {
    const perm = parsePermission("*:*");
    expect(perm).toEqual({ resource: "*", action: "*" });
  });

  it("throws on invalid format", () => {
    expect(() => parsePermission("post")).toThrow("Invalid permission format");
  });

  it("throws on empty string", () => {
    expect(() => parsePermission("")).toThrow("Invalid permission format");
  });

  it("throws on double colon", () => {
    expect(() => parsePermission("post::read")).toThrow("Invalid permission format");
  });

  it("returns a frozen object", () => {
    const perm = parsePermission("post:read");
    expect(Object.isFrozen(perm)).toBe(true);
  });
});

describe("isValidPermission", () => {
  it("returns true for valid permissions", () => {
    expect(isValidPermission("post:read")).toBe(true);
    expect(isValidPermission("post:*")).toBe(true);
    expect(isValidPermission("*:*")).toBe(true);
    expect(isValidPermission("billing.invoice:refund")).toBe(true);
  });

  it("returns false for invalid permissions", () => {
    expect(isValidPermission("post")).toBe(false);
    expect(isValidPermission("")).toBe(false);
    expect(isValidPermission("post::read")).toBe(false);
    expect(isValidPermission(":read")).toBe(false);
  });
});

describe("matches", () => {
  it("matches exact permissions", () => {
    expect(matches("post:read", "post:read")).toBe(true);
  });

  it("does not match different actions", () => {
    expect(matches("post:read", "post:update")).toBe(false);
  });

  it("matches wildcard action", () => {
    expect(matches("post:*", "post:update")).toBe(true);
    expect(matches("post:*", "post:read")).toBe(true);
  });

  it("matches global wildcard", () => {
    expect(matches("*:*", "anything:goes")).toBe(true);
  });

  it("matches wildcard resource", () => {
    expect(matches("*:read", "post:read")).toBe(true);
    expect(matches("*:read", "user:read")).toBe(true);
  });

  it("does not match wildcard resource with different action", () => {
    expect(matches("*:read", "post:update")).toBe(false);
  });
});

describe("matchesPermission", () => {
  it("matches against a Permission object", () => {
    expect(matchesPermission("post:*", { resource: "post", action: "update" })).toBe(true);
  });

  it("does not match different resource", () => {
    expect(matchesPermission("post:*", { resource: "user", action: "read" })).toBe(false);
  });
});

describe("createPermissionRegistry", () => {
  it("registers and retrieves permissions", () => {
    const registry = createPermissionRegistry();
    registry.define("post:read");
    expect(registry.has("post:read")).toBe(true);
    expect(registry.get("post:read")).toEqual({ resource: "post", action: "read" });
  });

  it("registers with description", () => {
    const registry = createPermissionRegistry();
    registry.define("post:read", { description: "Read posts" });
    const entry = registry.getEntry("post:read");
    expect(entry?.description).toBe("Read posts");
  });

  it("registers with implied permissions", () => {
    const registry = createPermissionRegistry();
    registry.define("post:manage", { implies: ["post:read", "post:update", "post:delete"] });
    expect(registry.getImplied("post:manage")).toEqual(["post:read", "post:update", "post:delete"]);
  });

  it("throws on duplicate", () => {
    const registry = createPermissionRegistry();
    registry.define("post:read");
    expect(() => registry.define("post:read")).toThrow("Duplicate permission");
  });

  it("allows override when configured", () => {
    const registry = createPermissionRegistry({ allowOverride: true });
    registry.define("post:read");
    registry.define("post:read");
    expect(registry.has("post:read")).toBe(true);
  });

  it("lists all permissions", () => {
    const registry = createPermissionRegistry();
    registry.define("post:read");
    registry.define("post:update");
    expect(registry.all()).toEqual(["post:read", "post:update"]);
  });

  it("matches by pattern", () => {
    const registry = createPermissionRegistry();
    registry.define("post:read");
    registry.define("post:update");
    registry.define("user:read");
    const results = registry.match("post:*");
    expect(results).toHaveLength(2);
  });

  it("removes permissions", () => {
    const registry = createPermissionRegistry();
    registry.define("post:read");
    expect(registry.remove("post:read")).toBe(true);
    expect(registry.has("post:read")).toBe(false);
  });

  it("clears all permissions", () => {
    const registry = createPermissionRegistry();
    registry.define("post:read");
    registry.define("user:read");
    registry.clear();
    expect(registry.all()).toHaveLength(0);
  });
});
