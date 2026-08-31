/**
 * Authorization observability — events, metrics, and tracing.
 *
 * @module observability
 */

export {
  createPermissionEventEmitter,
  withObservability,
  type PermissionCheckEvent,
  type PermissionEventHandler,
} from "./observability.core.js";
