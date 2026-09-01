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
} from "@oyinlola141/lattice-errors";

export type { RPCErrorOptions } from "@oyinlola141/lattice-errors";
