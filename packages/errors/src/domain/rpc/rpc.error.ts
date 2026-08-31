/**
 * RPC error classes — re-exports from focused files.
 */

export {
  RPCError,
  createRPCError,
  isRPCError,
  RPCProcedureNotFoundError,
  RPCInvalidRequestError,
} from "./rpcError.base.js";
export type { RPCErrorOptions } from "./rpcError.base.js";

export {
  RPCValidationError,
  RPCAuthenticationError,
  RPCForbiddenError,
  RPCInternalError,
  RPCSerializationError,
  RPCDeserializationError,
  RPCDuplicateProcedureError,
} from "./rpcError.protocol.js";

export {
  RPCTimeoutError,
  RPCCancelledError,
  RPCTransportError,
  RPCUnavailableError,
  RPCRateLimitedError,
  RPCDeadlineExceededError,
} from "./rpcError.transport.js";
