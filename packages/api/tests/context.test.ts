import { describe, expect, it } from "vitest";

import type { APIContext } from "../src/api/context/context.type.js";

import {
  createAPIContext,
  RequestIdContextKey,
  TenantIdContextKey,
} from "../src/api/context/context.type.js";

describe("createAPIContext", () => {
  it("creates a context with the given requestId and state", () => {
    const context = createAPIContext("req-1", { userId: "user-1" });

    expect(context.requestId).toBe("req-1");
    expect(context.state).toEqual({ userId: "user-1" });
    expect(context.signal).toBeUndefined();
  });

  it("stores and retrieves typed values via typed keys", () => {
    const context = createAPIContext<string, { tenantId: string }>("req-2", {
      tenantId: "tenant-1",
    });

    context.set(TenantIdContextKey, "tenant-2");

    expect(context.get(TenantIdContextKey)).toBe("tenant-2");
  });

  it("returns undefined for unset keys", () => {
    const context = createAPIContext("req-3", {});

    expect(context.get(TenantIdContextKey)).toBeUndefined();
  });

  it("is immutable", () => {
    const context = createAPIContext("req-4", {});

    expect(() => {
      (context as unknown as Record<string, unknown>).requestId = "hacked";
    }).toThrow();
  });
});
