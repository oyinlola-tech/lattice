import { describe, expect, it } from "vitest";

import { APIOperationRegistry } from "../src/api/registry/index.js";

import { defineOperation } from "../src/api/operation/operation.type.js";

describe("APIOperationRegistry", () => {
  it("registers and retrieves operations", () => {
    const registry = new APIOperationRegistry();
    const operation = defineOperation({
      name: "users.create",
      handler: async () => ({ id: "1" }),
    });

    registry.register(operation);

    expect(registry.has("users.create")).toBe(true);
    expect(registry.get("users.create")).toBe(operation);
  });

  it("throws on duplicate registration", () => {
    const registry = new APIOperationRegistry();
    const operation = defineOperation({
      name: "users.create",
      handler: async () => ({ id: "1" }),
    });

    registry.register(operation);

    expect(() => {
      registry.register(operation);
    }).toThrow('Operation "users.create" is already registered.');
  });

  it("returns undefined for unknown operations", () => {
    const registry = new APIOperationRegistry();

    expect(registry.get("users.create")).toBeUndefined();
  });

  it("returns all registered operations", () => {
    const registry = new APIOperationRegistry();
    const operation1 = defineOperation({
      name: "users.create",
      handler: async () => ({ id: "1" }),
    });
    const operation2 = defineOperation({
      name: "users.get",
      handler: async () => ({ id: "1" }),
    });

    registry.register(operation1);
    registry.register(operation2);

    expect(registry.getAll()).toHaveLength(2);
  });

  it("finds operations by tag", () => {
    const registry = new APIOperationRegistry();
    const operation = defineOperation({
      name: "users.create",
      metadata: { tags: ["Users"] },
      handler: async () => ({ id: "1" }),
    });

    registry.register(operation);

    expect(registry.findByTag("Users")).toHaveLength(1);
    expect(registry.findByTag("Orders")).toHaveLength(0);
  });

  it("requires an operation or throws", () => {
    const registry = new APIOperationRegistry();

    expect(() => {
      registry.require("users.create");
    }).toThrow('Operation "users.create" is not registered.');
  });

  it("unregisters operations", () => {
    const registry = new APIOperationRegistry();
    const operation = defineOperation({
      name: "users.create",
      handler: async () => ({ id: "1" }),
    });

    registry.register(operation);
    expect(registry.has("users.create")).toBe(true);

    registry.unregister("users.create");
    expect(registry.has("users.create")).toBe(false);
  });

  it("prevents mutation when frozen", () => {
    const registry = new APIOperationRegistry();
    registry.freeze();

    const operation = defineOperation({
      name: "users.create",
      handler: async () => ({ id: "1" }),
    });

    expect(() => {
      registry.register(operation);
    }).toThrow("Cannot register operations on a frozen registry.");
  });
});
