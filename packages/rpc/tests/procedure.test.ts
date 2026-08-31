import { describe, expect, it } from "vitest";

import { createRPCProcedure } from "../src/rpc/procedure/rpcProcedure.type.js";

import { RPCProcedureRegistry } from "../src/rpc/procedure/rpcProcedureRegistry.core.js";

import { RPCProcedureRouter } from "../src/rpc/procedure/rpcProcedureRouter.core.js";

describe("createRPCProcedure", () => {
  it("creates a frozen procedure", () => {
    const procedure = createRPCProcedure("users.get", async () => "ok");

    expect(procedure.name).toBe("users.get");
    expect(() => {
      (procedure as unknown as Record<string, unknown>).name = "hacked";
    }).toThrow();
  });
});

describe("RPCProcedureRegistry", () => {
  it("registers and retrieves procedures", () => {
    const registry = new RPCProcedureRegistry();
    const procedure = createRPCProcedure("users.get", async () => "ok");

    registry.register(procedure);

    expect(registry.has("users.get")).toBe(true);
    expect(registry.get("users.get")).toBe(procedure);
  });

  it("throws on duplicate registration", () => {
    const registry = new RPCProcedureRegistry();
    const procedure = createRPCProcedure("users.get", async () => "ok");

    registry.register(procedure);

    expect(() => {
      registry.register(procedure);
    }).toThrow('RPC procedure "users.get" is already registered.');
  });

  it("lists all procedures", () => {
    const registry = new RPCProcedureRegistry();
    registry.register(createRPCProcedure("users.get", async () => "ok"));
    registry.register(createRPCProcedure("users.create", async () => "ok"));

    expect(registry.list()).toHaveLength(2);
  });

  it("unregisters procedures", () => {
    const registry = new RPCProcedureRegistry();
    registry.register(createRPCProcedure("users.get", async () => "ok"));

    expect(registry.has("users.get")).toBe(true);

    registry.unregister("users.get");

    expect(registry.has("users.get")).toBe(false);
  });
});

describe("RPCProcedureRouter", () => {
  it("registers and retrieves procedures", () => {
    const router = new RPCProcedureRouter();
    const procedure = createRPCProcedure("users.get", async () => "ok");

    router.register(procedure);

    expect(router.has("users.get")).toBe(true);
    expect(router.get("users.get")).toBe(procedure);
  });

  it("lists all procedures", () => {
    const router = new RPCProcedureRouter();
    router.register(createRPCProcedure("users.get", async () => "ok"));
    router.register(createRPCProcedure("users.create", async () => "ok"));

    expect(router.list()).toHaveLength(2);
  });
});
