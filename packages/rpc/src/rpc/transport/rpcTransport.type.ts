import type { RPCRequest } from "../types/rpcRequest.type.js";

import type { RPCResponse } from "../types/rpcResponse.type.js";

/**
 * Options for RPC transport requests.
 */
export interface RPCTransportRequestOptions {
  readonly signal?: AbortSignal;

  readonly timeout?: number;
}

/**
 * Transport interface for sending and receiving RPC messages.
 */
export interface RPCTransport {
  send(request: RPCRequest): Promise<RPCResponse>;

  close?(): Promise<void>;
}
