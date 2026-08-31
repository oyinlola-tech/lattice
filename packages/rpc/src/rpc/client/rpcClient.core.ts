import type { RPCRequestOptions } from "../types/rpcRequest.type.js";

import type { RPCResponse } from "../types/rpcResponse.type.js";

import type { RPCTransport } from "../transport/rpcTransport.type.js";

import { createRPCRequest } from "../types/rpcRequest.type.js";

import { RPCProcedureNotFoundError } from "../errors/rpc.errors.js";

import { DEFAULT_RPC_TIMEOUT, MAX_PENDING_REQUESTS } from "../constants/rpcConstants.core.js";

/**
 * Options for RPC client calls.
 */
export interface RPCCallOptions {
  readonly timeout?: number;

  readonly signal?: AbortSignal;

  readonly metadata?: Record<string, string | number | boolean | undefined>;
}

/**
 * RPC client for invoking remote procedures.
 */
export class RPCClient {
  private readonly transport: RPCTransport;

  private readonly pending = new Map<string, { resolve: (value: RPCResponse) => void; reject: (error: Error) => void }>();

  constructor(transport: RPCTransport) {
    this.transport = transport;
  }

  /**
   * Calls a remote procedure.
   */
  async call<TInput = unknown, TOutput = unknown>(
    procedure: string,
    input: TInput,
    options: RPCCallOptions = {},
  ): Promise<TOutput> {
    const id = crypto.randomUUID();
    const timeout = options.timeout ?? DEFAULT_RPC_TIMEOUT;

    if (this.pending.size >= MAX_PENDING_REQUESTS) {
      throw new Error("Too many pending RPC requests.");
    }

    const response = await Promise.race([
      this.transport.send(
        createRPCRequest({
          id,
          procedure,
          payload: input,
          metadata: options.metadata,
        }),
      ),
      this.createTimeout(id, timeout),
    ]);

    if (!response.success) {
      const error = new Error(response.error?.message ?? "RPC call failed.");
      (error as unknown as { code?: string }).code = response.error?.code;
      throw error;
    }

    return response.result as TOutput;
  }

  /**
   * Creates a timeout promise for an RPC call.
   */
  private createTimeout(id: string, timeout: number): Promise<RPCResponse> {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`RPC call timed out after ${timeout}ms.`));
      }, timeout);

      this.pending.set(id, {
        resolve: (response) => {
          clearTimeout(timer);
          resolve(response);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
    });
  }
}
