/**
 * @oyinlola141/lattice-adapters/errors
 *
 * Adapter error types — re-exported from @oyinlola141/lattice-errors.
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
} from "@oyinlola141/lattice-errors";

export type { AdapterErrorOptions } from "@oyinlola141/lattice-errors";
