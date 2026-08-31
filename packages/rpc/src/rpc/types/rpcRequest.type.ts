import type { RPCMetadata } from "./rpcMetadata.type.js";

import type { RPCProcedureName } from "./rpcProcedureName.type.js";

/**
 * An RPC request message.
 */
export interface RPCRequest<TPayload = unknown> {
  readonly id: string;

  readonly procedure: RPCProcedureName;

  readonly payload: TPayload;

  readonly metadata: RPCMetadata;

  readonly timestamp: number;
}

/**
 * Options for creating an RPC request.
 */
export interface RPCRequestOptions<TPayload = unknown> {
  readonly id: string;

  readonly procedure: RPCProcedureName;

  readonly payload: TPayload;

  readonly metadata?: RPCMetadata;

  readonly timestamp?: number;
}

/**
 * Creates an RPC request.
 */
export function createRPCRequest<TPayload = unknown>(
  options: RPCRequestOptions<TPayload>,
): RPCRequest<TPayload> {
  return Object.freeze({
    ...options,
    metadata: options.metadata ?? {},
    timestamp: options.timestamp ?? Date.now(),
  });
}
