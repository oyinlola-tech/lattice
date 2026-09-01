import type { RPCContext } from "../context/rpcContext.type.js";

import type { RPCRequest } from "../types/rpcRequest.type.js";

import type { RPCResponse } from "../types/rpcResponse.type.js";

import type { RPCProcedure } from "../procedure/rpcProcedure.type.js";

import type { RPCMiddlewareStack } from "../middleware/rpcMiddleware.core.js";

import { createRPCContext } from "../context/rpcContext.type.js";

import { createRPCResponse } from "../types/rpcResponse.type.js";

import {
  RPCProcedureNotFoundError,
  RPCValidationError,
} from "../errors/rpc.errors.js";

/**
 * Dispatches RPC requests to registered procedures.
 */
export class RPCDispatcher {
  private readonly registry: {
    require(name: string): RPCProcedure;
  };

  private readonly middleware: RPCMiddlewareStack;

  constructor(
    registry: { require(name: string): RPCProcedure },
    middleware: RPCMiddlewareStack,
  ) {
    this.registry = registry;
    this.middleware = middleware;
  }

  /**
   * Dispatches an RPC request.
   */
  async dispatch(request: RPCRequest): Promise<RPCResponse> {
    const procedure = this.registry.require(request.procedure);

    const signal = new AbortController().signal;
    const context = createRPCContext(request, signal);

    try {
      const result = await this.middleware.execute(context, async () => {
        return procedure.handler(request.payload, context);
      });

      return createRPCResponse(request.id, result);
    } catch (error) {
      if (error instanceof RPCProcedureNotFoundError) {
        throw error;
      }
      if (error instanceof RPCValidationError) {
        throw error;
      }
      throw new Error(
        `Handler for procedure "${request.procedure}" threw: ${String(error)}`,
      );
    }
  }
}
