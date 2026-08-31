import { describe, expect, it } from "vitest";

import { APIExecutor } from "../src/api/executor/executor.core.js";

import { createAPIContext } from "../src/api/context/context.type.js";

import { defineOperation } from "../src/api/operation/operation.type.js";

describe("APIExecutor", () => {
  it("executes an operation and returns a successful result", async () => {
    const executor = new APIExecutor();
    const operation = defineOperation({
      name: "users.get",
      handler: async () => ({ id: "1", name: "Alice" }),
    });
    const context = createAPIContext("req-1", {});

    const result = await executor.execute(operation, {}, context);

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.data).toEqual({ id: "1", name: "Alice" });
    }
  });

  it("returns a failed result when the handler throws", async () => {
    const executor = new APIExecutor();
    const operation = defineOperation({
      name: "users.get",
      handler: async () => {
        throw new Error("Not found");
      },
    });
    const context = createAPIContext("req-1", {});

    const result = await executor.execute(operation, {}, context);

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error.message).toBe("Not found");
    }
  });

  it("runs interceptors around the handler", async () => {
    const order: string[] = [];

    const loggingInterceptor = {
      async intercept(_context: unknown, next: () => Promise<unknown>) {
        order.push("before");
        const result = await next();
        order.push("after");
        return result;
      },
    };

    const executor = new APIExecutor([loggingInterceptor]);
    const operation = defineOperation({
      name: "users.get",
      handler: async () => {
        order.push("handler");
        return { id: "1" };
      },
    });
    const context = createAPIContext("req-1", {});

    await executor.execute(operation, {}, context);

    expect(order).toEqual(["before", "handler", "after"]);
  });

  it("supports nested interceptors", async () => {
    const order: string[] = [];

    const interceptorA = {
      async intercept(_context: unknown, next: () => Promise<unknown>) {
        order.push("a:before");
        const result = await next();
        order.push("a:after");
        return result;
      },
    };

    const interceptorB = {
      async intercept(_context: unknown, next: () => Promise<unknown>) {
        order.push("b:before");
        const result = await next();
        order.push("b:after");
        return result;
      },
    };

    const executor = new APIExecutor([interceptorA, interceptorB]);
    const operation = defineOperation({
      name: "users.get",
      handler: async () => {
        order.push("handler");
        return { id: "1" };
      },
    });
    const context = createAPIContext("req-1", {});

    await executor.execute(operation, {}, context);

    expect(order).toEqual(["a:before", "b:before", "handler", "b:after", "a:after"]);
  });
});
