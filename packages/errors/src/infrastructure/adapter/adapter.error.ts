/**
 * Adapter error classes — re-exports from focused files.
 */

export {
  AdapterError,
  createAdapterError,
  isAdapterError,
  AdapterNotFoundError,
  AdapterAlreadyRegisteredError,
} from "./adapterError.base.js";
export type { AdapterErrorOptions } from "./adapterError.base.js";

export {
  AdapterInitializationError,
  AdapterConfigurationError,
  AdapterDisposeError,
} from "./adapterError.lifecycle.js";

export {
  AdapterNotSupportedError,
  AdapterCapabilityMissingError,
  AdapterConnectionError,
  AdapterOperationError,
  AdapterTimeoutError,
} from "./adapterError.operation.js";
