/**
 * @zudojs/adapters/errors
 *
 * Adapter error types — re-exported from @zudojs/errors.
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
} from "@zudojs/errors";

export type { AdapterErrorOptions } from "@zudojs/errors";
