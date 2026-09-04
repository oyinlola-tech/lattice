/**
 * @zudojs/adapters/lifecycle
 *
 * Adapter lifecycle contracts.
 */

export type {
  AdapterHealthStatus,
  AdapterHealth,
  AdapterOperationOptions,
  LifecycleAdapter,
} from "./lifecycle.type.js";

export {
  createHealthyHealth,
  createDegradedHealth,
  createUnhealthyHealth,
} from "./lifecycle.type.js";
