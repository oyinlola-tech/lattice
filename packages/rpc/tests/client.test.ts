import { describe, expect, it } from "vitest";

import { RPCClient } from "../src/rpc/client/rpcClient.core.js";

import type { RPCTransport } from "../src/rpc/transport/rpcTransport.type.js";

import type { RPCRequest } from "../src/rpc/types/rpcRequest.type.js";

import type { RPCResponse } from "../src/rpc/types/rpcResponse.type.js";

class FakeTransport implements RPCTransport {
  public receivedRequest?: RPCRequest;

  async send(request: RPCRequest): Promise<RPCResponse> {
    this.receivedRequest = request;
    return {
      id: request.id,
      success: true,
      result: { echoed: request.payload },
    };
  }
}

describe("RPCClient", () => {
  it("calls a procedure and returns the result", async () => {
    const transport = new FakeTransport();
    const client = new RPCClient(transport);

    const result = await client.call("users.get", { id: "123" });

    expect(result).toEqual({ echoed: { id: "123" } });
    expect(transport.receivedRequest?.procedure).toBe("users.get");
  });

  it("throws on failed responses", async () => {
    const transport: RPCTransport = {
      async send(): Promise<RPCResponse> {
        return {
          id: "req-1",
          success: false,
          error: { code: "NOT_FOUND", message: "Not found" },
        };
      },
    };

    const client = new RPCClient(transport);

    await expect(client.call("users.get", { id: "123" })).rejects.toThrow("Not found");
  });
});
