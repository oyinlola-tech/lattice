/**
 * @oyinlola141/lattice-rpc/streaming
 *
 * Streaming types for RPC operations.
 */

/**
 * A streaming RPC procedure handler.
 */
export type RPCStreamingHandler<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  context: RPCContext,
) => AsyncIterable<TOutput>;

import type { RPCContext } from "../context/rpcContext.type.js";

/**
 * An RPC streaming procedure definition.
 */
export interface RPCStreamingProcedure<TInput = unknown, TOutput = unknown> {
  readonly name: string;

  readonly handler: RPCStreamingHandler<TInput, TOutput>;
}

/**
 * Creates a streaming RPC procedure.
 */
export function createRPCStreamingProcedure<TInput = unknown, TOutput = unknown>(
  name: string,
  handler: RPCStreamingHandler<TInput, TOutput>,
): RPCStreamingProcedure<TInput, TOutput> {
  return Object.freeze({
    name,
    handler,
  });
}
