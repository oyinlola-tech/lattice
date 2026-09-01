import type {
  Module,
} from "@oyinlola141/lattice-core";

/**
 * Lifecycle hook phases for modules.
 */
export type LifecyclePhase =
  | "initialize"
  | "start"
  | "stop"
  | "destroy";

/**
 * Result of a lifecycle operation.
 */
export interface LifecycleResult {
  readonly phase: LifecyclePhase;
  readonly succeeded: readonly string[];
  readonly failed: readonly LifecycleFailure[];
  readonly durationMs: number;
}

/**
 * Failure information for a lifecycle operation.
 */
export interface LifecycleFailure {
  readonly moduleId: string;
  readonly phase: LifecyclePhase;
  readonly error: Error;
  readonly durationMs: number;
}

/**
 * Context passed to lifecycle hooks.
 */
export interface LifecycleContext {
  readonly runtimeId: string;
  readonly environment: string;
  readonly phase: LifecyclePhase;
  readonly moduleId: string;
  readonly container: import("@oyinlola141/lattice-container").Container;
  readonly logger: import("@oyinlola141/lattice-logger").Logger;
}

/**
 * A module entry in the lifecycle manager.
 */
export interface ManagedModule {
  readonly module: Module;
  readonly depth: number;
  readonly dependencies: readonly string[];
}

/**
 * Options for lifecycle management.
 */
export interface LifecycleManagerOptions {
  readonly shutdownTimeout?: number;
  readonly continueOnFailure?: boolean;
  readonly parallelInitialization?: boolean;
}
