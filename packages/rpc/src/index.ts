/**
 * @zudoliblib/rpc
 *
 * Remote Procedure Call abstraction for the Zudolib framework.
 *
 * Provides transport-agnostic procedure invocation, middleware,
 * client/server contracts, and reliability utilities.
 *
 * @example
 * ```ts
 * import { RPCServer, RPCClient, createRPCProcedure, RPCMiddlewareStack } from "@zudoliblib/rpc";
 *
 * const server = new RPCServer();
 * server.register(createRPCProcedure("users.getUser", async (input) => {
 *   return userService.findById(input.id);
 * }));
 *
 * const client = new RPCClient(memoryTransport);
 * const user = await client.call("users.getUser", { id: "123" });
 * ```
 */

// Types
export type {
  RPCProcedureName,
  RPCMetadata,
  RPCMetadataOptions,
  RPCRequest,
  RPCRequestOptions,
  RPCErrorPayload,
  RPCResponse,
} from "./rpc/types/index.js";

export {
  createRPCMetadata,
  createRPCRequest,
  createRPCResponse,
  createRPCErrorResponse,
} from "./rpc/types/index.js";

// Constants
export {
  DEFAULT_RPC_TIMEOUT,
  MAX_RPC_PAYLOAD_SIZE,
  MAX_PENDING_REQUESTS,
  MAX_MIDDLEWARE,
  MAX_PROCEDURES,
  PROCEDURE_NAME_PATTERN,
} from "./rpc/constants/index.js";

// Errors
export type { RPCErrorOptions } from "./rpc/errors/index.js";

export {
  RPCError,
  RPCProcedureNotFoundError,
  RPCInvalidRequestError,
  RPCValidationError,
  RPCAuthenticationError,
  RPCForbiddenError,
  RPCTimeoutError,
  RPCCancelledError,
  RPCInternalError,
  RPCTransportError,
  RPCSerializationError,
  RPCDeserializationError,
  RPCUnavailableError,
  RPCRateLimitedError,
  RPCDeadlineExceededError,
  RPCDuplicateProcedureError,
  createRPCError,
  isRPCError,
} from "./rpc/errors/index.js";

// Procedures
export type {
  RPCHandler,
  RPCProcedure,
  RPCProcedureOptions,
} from "./rpc/procedure/index.js";

export { createRPCProcedure } from "./rpc/procedure/index.js";

export {
  RPCProcedureRegistry,
  RPCProcedureRouter,
} from "./rpc/procedure/index.js";

// Context
export type { RPCContext } from "./rpc/context/index.js";

export { createRPCContext } from "./rpc/context/index.js";

// Middleware
export type { RPCMiddleware } from "./rpc/middleware/index.js";

export { RPCMiddlewareStack } from "./rpc/middleware/index.js";

// Dispatcher
export { RPCDispatcher } from "./rpc/dispatcher/index.js";

// Server
export { RPCServer } from "./rpc/server/index.js";

// Transport
export type {
  RPCTransport,
  RPCTransportRequestOptions,
} from "./rpc/transport/index.js";

// Client
export type { RPCCallOptions } from "./rpc/client/index.js";

export { RPCClient } from "./rpc/client/index.js";

// Reliability
export {
  createTimeout,
  withTimeout,
  getRemainingTime,
  isDeadlineExceeded,
  throwIfDeadlineExceeded,
  createCancellableSignal,
  cancelSignal,
  DEFAULT_RETRY_OPTIONS,
  calculateRetryDelay,
  retry,
} from "./rpc/reliability/index.js";

export type { RPCBackoff, RPCRetryOptions } from "./rpc/reliability/index.js";

// Interceptors
export type { RPCInterceptor } from "./rpc/interceptor/index.js";

export { createNoopRPCInterceptor } from "./rpc/interceptor/index.js";

// Streaming
export type {
  RPCStreamingHandler,
  RPCStreamingProcedure,
} from "./rpc/streaming/index.js";

export { createRPCStreamingProcedure } from "./rpc/streaming/index.js";
