/**
 * Core lifecycle state machine and participant contracts.
 *
 * Lifecycle is the internal implementation used by LifecycleManager.
 * Consumers should use LifecycleManager as the primary API.
 */
export * from "./core/index.js";

export * from "./manager/index.js";

export * from "./scope/index.js";
