/**
 * @zudo/adapters/errors
 *
 * Adapter error types — re-exported from @zudo/errors.
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
} from "@zudo/errors";

export type { AdapterErrorOptions } from "@zudo/errors";
