/**
 * @zudoliblib/adapters/errors
 *
 * Adapter error types — re-exported from @zudoliblib/errors.
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
} from "@zudoliblib/errors";

export type { AdapterErrorOptions } from "@zudoliblib/errors";
