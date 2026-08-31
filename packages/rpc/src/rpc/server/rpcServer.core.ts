import type { RPCRequest } from "../types/rpcRequest.type.js";

import type { RPCResponse } from "../types/rpcResponse.type.js";

import type { RPCProcedure } from "../procedure/rpcProcedure.type.js";

import { RPCProcedureRegistry } from "../procedure/rpcProcedureRegistry.core.js";

import { RPCMiddlewareStack } from "../middleware/rpcMiddleware.core.js";

import { RPCDispatcher } from "../dispatcher/rpcDispatcher.core.js";

import { createRPCErrorResponse } from "../types/rpcResponse.type.js";

import {
  RPCInternalError,
  RPCProcedureNotFoundError,
  RPCValidationError,
} from "../errors/rpc.errors.js";

/**
 * RPC server that receives and dispatches requests.
 */
export class RPCServer {
  private readonly registry: RPCProcedureRegistry;

  private readonly middleware: RPCMiddlewareStack;

  private readonly dispatcher: RPCDispatcher;

  constructor(
    registry?: RPCProcedureRegistry,
    middleware?: RPCMiddlewareStack,
  ) {
    this.registry = registry ?? new RPCProcedureRegistry();
    this.middleware = middleware ?? new RPCMiddlewareStack();
    this.dispatcher = new RPCDispatcher(this.registry, this.middleware);
  }

  /**
   * Registers a procedure.
   */
  register(procedure: RPCProcedure): this {
    this.registry.register(procedure);
    return this;
  }

  /**
   * Handles an incoming RPC request.
   */
  async handle(request: RPCRequest): Promise<RPCResponse> {
    try {
      return await this.dispatcher.dispatch(request);
    } catch (error) {
      if (error instanceof RPCProcedureNotFoundError) {
        return createRPCErrorResponse(request.id, {
          code: "RPC_PROCEDURE_NOT_FOUND",
          message: error.message,
        });
      }
      if (error instanceof RPCValidationError) {
        return createRPCErrorResponse(request.id, {
          code: "RPC_VALIDATION_ERROR",
          message: error.message,
          details: error.issues,
        });
      }
      return createRPCErrorResponse(request.id, {
        code: "RPC_INTERNAL_ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }

  /**
   * Returns the procedure registry.
   */
  getRegistry(): RPCProcedureRegistry {
    return this.registry;
  }
}
