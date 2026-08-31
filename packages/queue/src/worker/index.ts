/**
 * Worker abstraction with lifecycle management.
 *
 * Provides the core Worker type and functions for creating
 * and managing job workers.
 */
export { createWorker, isWorker } from "./worker.core.js";

export type {
  Worker,
  WorkerOptions,
  WorkerStats,
  WorkerLifecycleState,
} from "./worker.type.js";
