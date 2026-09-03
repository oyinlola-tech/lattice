/**
 * @zudolib/adapters/errors
 *
 * Adapter error types — re-exported from @zudolib/errors.
 */

export {
  AdapterError,
  AdapterNotFoundError,
  AdapterAlreadyRegisteredError,
  AdapterNotSupportedError,
  AdapterCapabilityMissingError,
  AdapterConnectionError,
  AdapterOperationError,
  AdapterTimeoutError,
  AdapterDisposeError,
  AdapterInitializationError,
  AdapterConfigurationError,
  createAdapterError,
  isAdapterError,
} from "@zudolib/errors";

export type { AdapterErrorOptions } from "@zudolib/errors";
