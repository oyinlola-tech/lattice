import type { RPCMetadata } from "./rpcMetadata.type.js";

/**
 * Payload for an RPC error response.
 */
export interface RPCErrorPayload {
  readonly code: string;

  readonly message: string;

  readonly details?: unknown;
}

/**
 * Creates an RPC error payload.
 */
export function createRPCErrorPayload(
  code: string,
  message: string,
  details?: unknown,
): RPCErrorPayload {
  return Object.freeze({
    code,
    message,
    ...(details !== undefined ? { details } : {}),
  });
}

/**
 * An RPC response message.
 */
export interface RPCResponse<TResult = unknown> {
  readonly id: string;

  readonly success: boolean;

  readonly result?: TResult;

  readonly error?: RPCErrorPayload;

  readonly metadata?: RPCMetadata;
}

/**
 * Creates a successful RPC response.
 */
export function createRPCResponse<TResult = unknown>(
  id: string,
  result: TResult,
  metadata?: RPCMetadata,
): RPCResponse<TResult> {
  return Object.freeze({
    id,
    success: true,
    result,
    ...(metadata !== undefined ? { metadata } : {}),
  });
}

/**
 * Creates a failed RPC response.
 */
export function createRPCErrorResponse(
  id: string,
  error: RPCErrorPayload,
  metadata?: RPCMetadata,
): RPCResponse<never> {
  return Object.freeze({
    id,
    success: false,
    error,
    ...(metadata !== undefined ? { metadata } : {}),
  });
}
