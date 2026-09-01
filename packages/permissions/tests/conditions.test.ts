import { describe, it, expect } from "vitest";
import {
  allOf,
  anyOf,
  not,
  always,
  never,
  isOwner,
  tenantIsolation,
} from "../src/index.js";
import type { PermissionContext } from "../src/index.js";

const makeContext = (
  overrides?: Partial<PermissionContext>,
): PermissionContext => ({
  actor: { id: "user_1", roles: ["admin"] },
  permission: { resource: "post", action: "read" },
  ...overrides,
});

describe("always", () => {
  it("returns true", async () => {
    expect(await always()(makeContext())).toBe(true);
  });
});

describe("never", () => {
  it("returns false", async () => {
    expect(await never()(makeContext())).toBe(false);
  });
});

describe("not", () => {
  it("negates a condition", async () => {
    expect(await not(always())(makeContext())).toBe(false);
    expect(await not(never())(makeContext())).toBe(true);
  });
});

describe("allOf", () => {
  it("returns true when all conditions pass", async () => {
    const condition = allOf(always(), always(), always());
    expect(await condition(makeContext())).toBe(true);
  });

  it("returns false when any condition fails", async () => {
    const condition = allOf(always(), never(), always());
    expect(await condition(makeContext())).toBe(false);
  });

  it("returns false for empty input", async () => {
    const condition = allOf();
    expect(await condition(makeContext())).toBe(true);
  });
});

describe("anyOf", () => {
  it("returns true when any condition passes", async () => {
    const condition = anyOf(never(), never(), always());
    expect(await condition(makeContext())).toBe(true);
  });

  it("returns false when all conditions fail", async () => {
    const condition = anyOf(never(), never(), never());
    expect(await condition(makeContext())).toBe(false);
  });

  it("returns false for empty input", async () => {
    const condition = anyOf();
    expect(await condition(makeContext())).toBe(false);
  });
});

describe("isOwner", () => {
  it("returns true when actor owns the resource", async () => {
    const ctx = makeContext({
      actor: { id: "user_1", roles: [] },
      resource: { ownerId: "user_1" },
    });
    expect(await isOwner()(ctx)).toBe(true);
  });

  it("returns false when actor does not own the resource", async () => {
    const ctx = makeContext({
      actor: { id: "user_1", roles: [] },
      resource: { ownerId: "user_2" },
    });
    expect(await isOwner()(ctx)).toBe(false);
  });

  it("returns false when resource is null", async () => {
    const ctx = makeContext({ resource: undefined });
    expect(await isOwner()(ctx)).toBe(false);
  });

  it("supports custom owner field", async () => {
    const ctx = makeContext({
      actor: { id: "user_1", roles: [] },
      resource: { authorId: "user_1" },
    });
    expect(await isOwner("authorId")(ctx)).toBe(true);
  });
});

describe("tenantIsolation", () => {
  it("returns true when tenants match", async () => {
    const ctx = makeContext({
      metadata: new Map([["tenantId", "tenant_1"]]),
      resource: { tenantId: "tenant_1" },
    });
    expect(await tenantIsolation()(ctx)).toBe(true);
  });

  it("returns false when tenants differ", async () => {
    const ctx = makeContext({
      metadata: new Map([["tenantId", "tenant_1"]]),
      resource: { tenantId: "tenant_2" },
    });
    expect(await tenantIsolation()(ctx)).toBe(false);
  });

  it("returns false when actor has no tenant", async () => {
    const ctx = makeContext({
      metadata: new Map(),
      resource: { tenantId: "tenant_1" },
    });
    expect(await tenantIsolation()(ctx)).toBe(false);
  });

  it("returns false when resource is null", async () => {
    const ctx = makeContext({
      metadata: new Map([["tenantId", "tenant_1"]]),
      resource: undefined,
    });
    expect(await tenantIsolation()(ctx)).toBe(false);
  });

  it("supports custom field names", async () => {
    const ctx = makeContext({
      metadata: new Map([["orgId", "org_1"]]),
      resource: { organizationId: "org_1" },
    });
    expect(await tenantIsolation("orgId", "organizationId")(ctx)).toBe(true);
  });
});
