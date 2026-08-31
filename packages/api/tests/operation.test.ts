import { describe, expect, it } from "vitest";

import { defineOperation } from "../src/api/operation/operation.type.js";

describe("defineOperation", () => {
  it("creates an operation with the given options", () => {
    const operation = defineOperation({
      name: "users.create",
      handler: async () => ({ id: "1" }),
    });

    expect(operation.name).toBe("users.create");
    expect(operation.handler).toBeDefined();
  });

  it("freezes the operation", () => {
    const operation = defineOperation({
      name: "users.create",
      handler: async () => ({ id: "1" }),
    });

    expect(() => {
      (operation as unknown as Record<string, unknown>).name = "hacked";
    }).toThrow();
  });

  it("preserves input and output schemas", () => {
    const inputSchema = { parse: () => ({}) };
    const outputSchema = { parse: () => ({}) };

    const operation = defineOperation({
      name: "users.create",
      input: inputSchema,
      output: outputSchema,
      handler: async () => ({ id: "1" }),
    });

    expect(operation.input).toBe(inputSchema);
    expect(operation.output).toBe(outputSchema);
  });

  it("preserves metadata", () => {
    const operation = defineOperation({
      name: "users.create",
      metadata: {
        tags: ["Users"],
        timeout: 5_000,
      },
      handler: async () => ({ id: "1" }),
    });

    expect(operation.metadata?.tags).toEqual(["Users"]);
    expect(operation.metadata?.timeout).toBe(5_000);
  });
});
