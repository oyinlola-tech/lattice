/**
 * @lattice/adapters/errors
 *
 * Adapter error types — re-exported from @lattice/errors.
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
} from "@lattice/errors";

export type { AdapterErrorOptions } from "@lattice/errors";
