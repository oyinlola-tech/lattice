import type {
  ApplicationContext,
} from "../application/application-context.js";

import type {
  ConfigurationManager,
} from "../configuration/configuration-manager.js";

import type {
  Logger,
} from "../logging/logger.js";

import type {
  ModuleLoader,
} from "../modules/module-loader.js";

import type {
  ModuleLifecycleManager,
} from "../modules/module-lifecycle.js";

import type {
  ModuleRegistry,
} from "../modules/module-registry.js";

import {
  RuntimeState,
  createRuntimeStateSnapshot,
  type RuntimeStateSnapshot,
} from "./runtime-state.js";

import type {
  RuntimeMode,
  RuntimeRole,
} from "./runtime-options.js";

/**
 * Runtime identity.
 *
 * Identifies the current runtime instance independently from
 * the application itself.
 */
export interface RuntimeIdentity {
  /**
   * Unique identifier for this runtime instance.
   */
  readonly id: string;

  /**
   * Human readable runtime name.
   */
  readonly name: string;

  /**
   * Runtime execution mode.
   */
  readonly mode: RuntimeMode;

  /**
   * Runtime role.
   */
  readonly role: RuntimeRole;

  /**
   * Runtime creation timestamp.
   */
  readonly createdAt: Date;

  /**
   * Process identifier when available.
   */
  readonly processId?: number;
}

/**
 * Runtime timing information.
 */
export interface RuntimeTiming {
  /**
   * Time at which the runtime was created.
   */
  readonly createdAt: Date;

  /**
   * Time at which startup began.
   */
  readonly startupStartedAt?: Date;

  /**
   * Time at which the runtime became ready.
   */
  readonly readyAt?: Date;

  /**
   * Time at which shutdown began.
   */
  readonly shutdownStartedAt?: Date;

  /**
   * Time at which the runtime stopped.
   */
  readonly stoppedAt?: Date;
}

/**
 * Runtime context dependencies.
 */
export interface RuntimeContextDependencies {
  /**
   * Application context.
   */
  readonly application:
    ApplicationContext;

  /**
   * Configuration manager.
   */
  readonly configuration:
    ConfigurationManager;

  /**
   * Logger.
   */
  readonly logger:
    Logger;

  /**
   * Module registry.
   */
  readonly moduleRegistry:
    ModuleRegistry;

  /**
   * Module loader.
   */
  readonly moduleLoader:
    ModuleLoader;

  /**
   * Module lifecycle manager.
   */
  readonly moduleLifecycle:
    ModuleLifecycleManager;
}

/**
 * Runtime context contract.
 *
 * Provides read-only access to the runtime environment and
 * runtime-owned infrastructure.
 */
export interface RuntimeContext {
  /**
   * Runtime identity.
   */
  readonly identity:
    RuntimeIdentity;

  /**
   * Current runtime state.
   */
  readonly state:
    RuntimeState;

  /**
   * Runtime timing information.
   */
  readonly timing:
    RuntimeTiming;

  /**
   * Runtime metadata.
   */
  readonly metadata:
    Readonly<
      Record<string, unknown>
    >;

  /**
   * Application context.
   */
  readonly application:
    ApplicationContext;

  /**
   * Configuration manager.
   */
  readonly configuration:
    ConfigurationManager;

  /**
   * Logger.
   */
  readonly logger:
    Logger;

  /**
   * Module registry.
   */
  readonly moduleRegistry:
    ModuleRegistry;

  /**
   * Module loader.
   */
  readonly moduleLoader:
    ModuleLoader;

  /**
   * Module lifecycle manager.
   */
  readonly moduleLifecycle:
    ModuleLifecycleManager;

  /**
   * Returns a state snapshot.
   */
  getStateSnapshot():
    RuntimeStateSnapshot;

  /**
   * Returns a runtime metadata value.
   */
  get<T = unknown>(
    key: string,
  ):
    T | undefined;

  /**
   * Checks whether a metadata key exists.
   */
  has(
    key: string,
  ): boolean;

  /**
   * Returns elapsed runtime time in milliseconds.
   */
  getUptime():
    number;
}

/**
 * Internal mutable state used by RuntimeContext.
 */
export interface RuntimeContextState {
  /**
   * Current runtime state.
   */
  state:
    RuntimeState;

  /**
   * Runtime timing.
   */
  timing:
    RuntimeTiming;
}

/**
 * Default RuntimeContext implementation.
 */
export class DefaultRuntimeContext
  implements RuntimeContext {
  private readonly _identity:
    RuntimeIdentity;

  private readonly _metadata:
    Readonly<
      Record<string, unknown>
    >;

  private readonly _application:
    ApplicationContext;

  private readonly _configuration:
    ConfigurationManager;

  private readonly _logger:
    Logger;

  private readonly _moduleRegistry:
    ModuleRegistry;

  private readonly _moduleLoader:
    ModuleLoader;

  private readonly _moduleLifecycle:
    ModuleLifecycleManager;

  private readonly _state:
    RuntimeContextState;

  public constructor(
    identity: RuntimeIdentity,
    dependencies:
      RuntimeContextDependencies,
    metadata:
      Readonly<
        Record<string, unknown>
      > = {},
  ) {
    this._identity =
      Object.freeze({
        ...identity,
      });

    this._metadata =
      Object.freeze({
        ...metadata,
      });

    this._application =
      dependencies.application;

    this._configuration =
      dependencies.configuration;

    this._logger =
      dependencies.logger;

    this._moduleRegistry =
      dependencies.moduleRegistry;

    this._moduleLoader =
      dependencies.moduleLoader;

    this._moduleLifecycle =
      dependencies.moduleLifecycle;

    this._state = {
      state:
        RuntimeState.CREATED,

      timing: {
        createdAt:
          identity.createdAt,
      },
    };
  }

  /**
   * Runtime identity.
   */
  public get identity():
    RuntimeIdentity {
    return this._identity;
  }

  /**
   * Current runtime state.
   */
  public get state():
    RuntimeState {
    return this._state.state;
  }

  /**
   * Runtime timing.
   */
  public get timing():
    RuntimeTiming {
    return Object.freeze({
      ...this._state.timing,
    });
  }

  /**
   * Runtime metadata.
   */
  public get metadata():
    Readonly<
      Record<string, unknown>
    > {
    return this._metadata;
  }

  /**
   * Application context.
   */
  public get application():
    ApplicationContext {
    return this._application;
  }

  /**
   * Configuration manager.
   */
  public get configuration():
    ConfigurationManager {
    return this._configuration;
  }

  /**
   * Logger.
   */
  public get logger():
    Logger {
    return this._logger;
  }

  /**
   * Module registry.
   */
  public get moduleRegistry():
    ModuleRegistry {
    return this._moduleRegistry;
  }

  /**
   * Module loader.
   */
  public get moduleLoader():
    ModuleLoader {
    return this._moduleLoader;
  }

  /**
   * Module lifecycle manager.
   */
  public get moduleLifecycle():
    ModuleLifecycleManager {
    return this._moduleLifecycle;
  }

  /**
   * Returns a snapshot of the current runtime state.
   */
  public getStateSnapshot():
    RuntimeStateSnapshot {
    return createRuntimeStateSnapshot(
      this._state.state,
    );
  }

  /**
   * Reads a metadata value.
   */
  public get<T = unknown>(
    key: string,
  ):
    T | undefined {
    return this._metadata[key] as
      | T
      | undefined;
  }

  /**
   * Checks whether metadata contains a key.
   */
  public has(
    key: string,
  ): boolean {
    return Object.prototype.hasOwnProperty.call(
      this._metadata,
      key,
    );
  }

  /**
   * Returns runtime uptime.
   *
   * Uptime starts when the runtime context is created.
   */
  public getUptime():
    number {
    return (
      Date.now() -
      this._identity.createdAt.getTime()
    );
  }

  /**
   * Updates the runtime state.
   *
   * This method is intentionally not exposed through the
   * RuntimeContext interface. Runtime orchestration owns
   * lifecycle state changes.
   */
  public setState(
    state:
      RuntimeState,
  ): void {
    this._state.state =
      state;

    this.updateTimingForState(
      state,
    );
  }

  /**
   * Updates runtime timing based on state.
   */
  private updateTimingForState(
    state:
      RuntimeState,
  ): void {
    const now =
      new Date();

    switch (state) {
      case RuntimeState.BOOTSTRAPPING:
        this._state.timing = {
          ...this._state.timing,

          startupStartedAt:
            this._state.timing
              .startupStartedAt ??
            now,
        };

        break;

      case RuntimeState.READY:
        this._state.timing = {
          ...this._state.timing,

          readyAt:
            this._state.timing
              .readyAt ??
            now,
        };

        break;

      case RuntimeState.STOPPING:
        this._state.timing = {
          ...this._state.timing,

          shutdownStartedAt:
            this._state.timing
              .shutdownStartedAt ??
            now,
        };

        break;

      case RuntimeState.STOPPED:
        this._state.timing = {
          ...this._state.timing,

          stoppedAt:
            this._state.timing
              .stoppedAt ??
            now,
        };

        break;

      default:
        break;
    }
  }
}

/**
 * Creates a unique runtime identifier.
 */
export function createRuntimeId(
  name:
    string,
): string {
  const timestamp =
    Date.now().toString(
      36,
    );

  const random =
    Math.random()
      .toString(36)
      .slice(
        2,
        10,
      );

  const normalizedName =
    name
      .trim()
      .toLowerCase()
      .replace(
        /[^a-z0-9]+/g,
        "-",
      )
      .replace(
        /^-+|-+$/g,
        "",
      );

  return [
    normalizedName ||
      "runtime",

    timestamp,

    random,
  ].join(
    "-",
  );
}

/**
 * Creates a RuntimeIdentity.
 */
export function createRuntimeIdentity(
  options: {
    readonly name:
      string;

    readonly mode:
      RuntimeMode;

    readonly role:
      RuntimeRole;

    readonly id?:
      string;

    readonly processId?:
      number;
  },
): RuntimeIdentity {
  const createdAt =
    new Date();

  return Object.freeze({
    id:
      options.id ??
      createRuntimeId(
        options.name,
      ),

    name:
      options.name,

    mode:
      options.mode,

    role:
      options.role,

    createdAt,

    processId:
      options.processId ??
      getProcessId(),
  });
}

/**
 * Creates a RuntimeContext.
 */
export function createRuntimeContext(
  identity:
    RuntimeIdentity,
  dependencies:
    RuntimeContextDependencies,
  metadata:
    Readonly<
      Record<string, unknown>
    > = {},
): DefaultRuntimeContext {
  return new DefaultRuntimeContext(
    identity,
    dependencies,
    metadata,
  );
}

/**
 * Attempts to retrieve the current process ID
 * without requiring a Node.js process type.
 */
function getProcessId():
  | number
  | undefined {
  const runtimeProcess =
    (
      globalThis as {
        process?: {
          pid?: number;
        };
      }
    ).process;

  return runtimeProcess?.pid;
}