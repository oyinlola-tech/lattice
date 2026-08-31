import type { RPCContext } from "../context/rpcContext.type.js";

/**
 * Middleware function for the RPC pipeline.
 */
export type RPCMiddleware = (
  context: RPCContext,
  next: () => Promise<unknown>,
) => Promise<unknown>;

/**
 * Stack of RPC middleware.
 */
export class RPCMiddlewareStack {
  private readonly middleware: readonly RPCMiddleware[];

  constructor(middleware: RPCMiddleware[] = []) {
    this.middleware = Object.freeze([...middleware]);
  }

  /**
   * Executes the middleware stack around the given handler.
   */
  async execute(
    context: RPCContext,
    handler: () => Promise<unknown>,
  ): Promise<unknown> {
    const stack = this.middleware;
    let index = 0;

    const runNext = async (): Promise<unknown> => {
      if (index >= stack.length) {
        return handler();
      }

      const mw = stack[index];
      index += 1;

      if (!mw) {
        return handler();
      }

      return mw(context, runNext);
    };

    return runNext();
  }
}
