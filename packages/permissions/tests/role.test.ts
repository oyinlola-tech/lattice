import { describe, it, expect } from "vitest";
import { createRoleRegistry, resolveRolePermissions } from "../src/index.js";

describe("createRoleRegistry", () => {
  it("registers and retrieves roles", () => {
    const registry = createRoleRegistry();
    registry.define({ name: "admin", permissions: ["*:*"] });
    expect(registry.has("admin")).toBe(true);
    expect(registry.get("admin")?.permissions).toEqual(["*:*"]);
  });

  it("throws on empty name", () => {
    const registry = createRoleRegistry();
    expect(() =>
      registry.define({ name: "", permissions: ["post:read"] }),
    ).toThrow("Role name cannot be empty");
  });

  it("throws on empty permissions", () => {
    const registry = createRoleRegistry();
    expect(() => registry.define({ name: "admin", permissions: [] })).toThrow(
      "must have at least one permission",
    );
  });

  it("throws on duplicate", () => {
    const registry = createRoleRegistry();
    registry.define({ name: "admin", permissions: ["*:*"] });
    expect(() =>
      registry.define({ name: "admin", permissions: ["post:read"] }),
    ).toThrow("Duplicate role");
  });

  it("allows override when configured", () => {
    const registry = createRoleRegistry({ allowOverride: true });
    registry.define({ name: "admin", permissions: ["*:*"] });
    registry.define({ name: "admin", permissions: ["post:read"] });
    expect(registry.get("admin")?.permissions).toEqual(["post:read"]);
  });

  it("lists all role names", () => {
    const registry = createRoleRegistry();
    registry.define({ name: "admin", permissions: ["*:*"] });
    registry.define({ name: "editor", permissions: ["post:read"] });
    expect(registry.names()).toEqual(["admin", "editor"]);
  });

  it("gets all role definitions", () => {
    const registry = createRoleRegistry();
    registry.define({ name: "admin", permissions: ["*:*"] });
    expect(registry.all()).toHaveLength(1);
  });

  it("removes roles", () => {
    const registry = createRoleRegistry();
    registry.define({ name: "admin", permissions: ["*:*"] });
    expect(registry.remove("admin")).toBe(true);
    expect(registry.has("admin")).toBe(false);
  });

  it("clears all roles", () => {
    const registry = createRoleRegistry();
    registry.define({ name: "admin", permissions: ["*:*"] });
    registry.define({ name: "editor", permissions: ["post:read"] });
    registry.clear();
    expect(registry.names()).toHaveLength(0);
  });
});

describe("resolveRolePermissions", () => {
  const roles = new Map([
    ["admin", { name: "admin", permissions: ["*:*"], inherits: ["editor"] }],
    [
      "editor",
      {
        name: "editor",
        permissions: ["post:read", "post:update"],
        inherits: ["reader"],
      },
    ],
    ["reader", { name: "reader", permissions: ["post:read"] }],
  ]);

  const getRole = (name: string) => roles.get(name);

  it("resolves direct permissions", () => {
    const perms = resolveRolePermissions(["reader"], getRole);
    expect(perms).toEqual(["post:read"]);
  });

  it("resolves inherited permissions", () => {
    const perms = resolveRolePermissions(["editor"], getRole);
    expect(perms).toContain("post:read");
    expect(perms).toContain("post:update");
  });

  it("resolves deep inheritance", () => {
    const perms = resolveRolePermissions(["admin"], getRole);
    expect(perms).toContain("*:*");
    expect(perms).toContain("post:read");
    expect(perms).toContain("post:update");
  });

  it("deduplicates permissions", () => {
    const perms = resolveRolePermissions(["editor", "reader"], getRole);
    const unique = new Set(perms);
    expect(perms.length).toBe(unique.size);
  });

  it("throws on missing role", () => {
    expect(() => resolveRolePermissions(["nonexistent"], getRole)).toThrow(
      "Role not found",
    );
  });

  it("throws on circular inheritance", () => {
    const circular = new Map([
      ["a", { name: "a", permissions: ["a:read"], inherits: ["b"] }],
      ["b", { name: "b", permissions: ["b:read"], inherits: ["a"] }],
    ]);
    expect(() => resolveRolePermissions(["a"], (n) => circular.get(n))).toThrow(
      "Circular role inheritance",
    );
  });

  it("returns empty for empty input", () => {
    const perms = resolveRolePermissions([], getRole);
    expect(perms).toEqual([]);
  });
});
