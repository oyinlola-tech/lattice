import { describe, expect, it } from "vitest";

import type { RPCMiddleware } from "../src/rpc/middleware/rpcMiddleware.core.js";

import { RPCMiddlewareStack } from "../src/rpc/middleware/rpcMiddleware.core.js";

import { createRPCContext } from "../src/rpc/context/rpcContext.type.js";

import { createRPCRequest } from "../src/rpc/types/rpcRequest.type.js";

describe("RPCMiddlewareStack", () => {
  it("executes the handler when no middleware is registered", async () => {
    const stack = new RPCMiddlewareStack();
    const context = createRPCContext(
      createRPCRequest({ id: "1", procedure: "test", payload: {} }),
      new AbortController().signal,
    );

    const result = await stack.execute(context, async () => "ok");

    expect(result).toBe("ok");
  });

  it("executes middleware in order", async () => {
    const order: string[] = [];

    const middlewareA: RPCMiddleware = async (context, next) => {
      order.push("a:before");
      const result = await next();
      order.push("a:after");
      return result;
    };

    const middlewareB: RPCMiddleware = async (context, next) => {
      order.push("b:before");
      const result = await next();
      order.push("b:after");
      return result;
    };

    const stack = new RPCMiddlewareStack([middlewareA, middlewareB]);
    const context = createRPCContext(
      createRPCRequest({ id: "1", procedure: "test", payload: {} }),
      new AbortController().signal,
    );

    await stack.execute(context, async () => "ok");

    expect(order).toEqual(["a:before", "b:before", "b:after", "a:after"]);
  });
});
