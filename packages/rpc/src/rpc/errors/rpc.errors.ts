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
} from "@zudoliblib/errors";

export type { RPCErrorOptions } from "@zudoliblib/errors";
