import type {
  ModuleId,
} from "../module.js";

import type {
  ModuleContext,
} from "../moduleContext.context.js";

/**
 * Lifecycle phases supported by the module system.
 */
export type ModuleLifecyclePhase =
  | "created"
  | "initializing"
  | "initialized"
  | "starting"
  | "started"
  | "stopping"
  | "stopped"
  | "destroying"
  | "destroyed"
  | "failed";

/**
 * Runtime lifecycle state for a module.
 */
export interface ModuleLifecycleState {
  readonly moduleId:
    ModuleId;

  readonly phase:
    ModuleLifecyclePhase;

  readonly error?:
    unknown;

  readonly initializedAt?:
    Date;

  readonly startedAt?:
    Date;

  readonly stoppedAt?:
    Date;

  readonly destroyedAt?:
    Date;
}

/**
 * Lifecycle hooks supported by a module.
 *
 * Modules can implement any subset of these hooks.
 */
export interface ModuleLifecycleHooks {
  /**
   * Called before the module starts accepting work.
   */
  initialize?(
    context: ModuleContext,
  ):
    | void
    | Promise<void>;

  /**
   * Called after all modules have initialized.
   *
   * This is useful when a module needs other modules to
   * already be initialized before it becomes active.
   */
  start?(
    context: ModuleContext,
  ):
    | void
    | Promise<void>;

  /**
   * Called when the application begins shutting down.
   */
  stop?(
    context: ModuleContext,
  ):
    | void
    | Promise<void>;

  /**
   * Called after the module has stopped.
   *
   * This is the place for final resource cleanup.
   */
  destroy?(
    context: ModuleContext,
  ):
    | void
    | Promise<void>;
}

/**
 * Options controlling module lifecycle behavior.
 */
export interface ModuleLifecycleOptions {
  /**
   * Whether initialization should continue when one module fails.
   *
   * Defaults to false.
   */
  readonly continueOnInitializeError?: boolean;

  /**
   * Whether startup should continue when one module fails.
   *
   * Defaults to false.
   */
  readonly continueOnStartError?: boolean;

  /**
   * Whether shutdown should continue when one module fails.
   *
   * Defaults to true.
   */
  readonly continueOnStopError?: boolean;

  /**
   * Whether destruction should continue when one module fails.
   *
   * Defaults to true.
   */
  readonly continueOnDestroyError?: boolean;
}

import {
  ModuleLifecycleError as BaseModuleLifecycleError,
} from "@oyinlola141/lattice-errors";

/**
 * Error thrown when a module lifecycle operation fails.
 */
export class ModuleLifecycleError
  extends BaseModuleLifecycleError {
  public constructor(
    moduleId: ModuleId,
    phase: ModuleLifecyclePhase,
    cause: unknown,
  ) {
    const message =
      cause instanceof Error
        ? cause.message
        : String(cause);

    super(
      moduleId,
      phase,
      `Module "${moduleId}" failed during ${phase}: ${message}`,
      cause,
    );
  }
}

/**
 * Result of a lifecycle operation.
 */
export interface ModuleLifecycleResult {
  readonly completed:
    readonly ModuleId[];

  readonly failed:
    readonly ModuleId[];
}

/**
 * Internal lifecycle state map.
 */
export type LifecycleStateMap =
  Map<
    ModuleId,
    ModuleLifecycleState
  >;
