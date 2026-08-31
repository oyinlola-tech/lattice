import type { RPCMetadata } from "../types/rpcMetadata.type.js";

import type { RPCProcedureName } from "../types/rpcProcedureName.type.js";

import type { RPCContext } from "../context/rpcContext.type.js";

/**
 * Handler for an RPC procedure.
 */
export type RPCHandler<TInput = unknown, TOutput = unknown> = (
  input: TInput,
  context: RPCContext,
) => Promise<TOutput> | TOutput;

/**
 * Options for an RPC procedure.
 */
export interface RPCProcedureOptions {
  readonly idempotent?: boolean;

  readonly timeout?: number;

  readonly description?: string;
}

/**
 * An RPC procedure definition.
 */
export interface RPCProcedure<TInput = unknown, TOutput = unknown> {
  readonly name: RPCProcedureName;

  readonly handler: RPCHandler<TInput, TOutput>;

  readonly options?: RPCProcedureOptions;
}

/**
 * Creates a new RPC procedure.
 */
export function createRPCProcedure<TInput = unknown, TOutput = unknown>(
  name: RPCProcedureName,
  handler: RPCHandler<TInput, TOutput>,
  options: RPCProcedureOptions = {},
): RPCProcedure<TInput, TOutput> {
  return Object.freeze({
    name,
    handler,
    options: Object.freeze(options),
  });
}
