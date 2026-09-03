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
} from "@zudolib/errors";

export type { RPCErrorOptions } from "@zudolib/errors";
