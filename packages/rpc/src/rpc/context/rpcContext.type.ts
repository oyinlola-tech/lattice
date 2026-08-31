import type { RPCMetadata } from "../types/rpcMetadata.type.js";

import type { RPCRequest } from "../types/rpcRequest.type.js";

/**
 * Context passed through the RPC execution pipeline.
 */
export interface RPCContext {
  readonly request: RPCRequest;

  readonly metadata: RPCMetadata;

  readonly signal: AbortSignal;

  readonly state: Map<string, unknown>;

  get<T>(key: string): T | undefined;

  set<T>(key: string, value: T): void;
}

/**
 * Creates a new RPC context.
 */
export function createRPCContext(
  request: RPCRequest,
  signal: AbortSignal,
): RPCContext {
  const state = new Map<string, unknown>();

  const context = {
    request,
    metadata: request.metadata,
    signal,
    state,
    get<T>(key: string): T | undefined {
      return state.get(key) as T | undefined;
    },
    set<T>(key: string, value: T): void {
      state.set(key, value);
    },
  };

  return Object.freeze(context) as RPCContext;
}
