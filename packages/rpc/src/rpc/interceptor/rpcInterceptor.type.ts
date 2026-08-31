import type { RPCContext } from "../context/rpcContext.type.js";

/**
 * Interceptor that wraps RPC procedure execution.
 */
export interface RPCInterceptor {
  intercept(
    context: RPCContext,
    next: () => Promise<unknown>,
  ): Promise<unknown>;
}

/**
 * Creates a no-op interceptor.
 */
export function createNoopRPCInterceptor(): RPCInterceptor {
  return {
    async intercept(_context, next) {
      return next();
    },
  };
}
