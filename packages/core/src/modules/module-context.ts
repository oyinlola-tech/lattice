import type {
  ApplicationContext,
} from "../application/application-context.js";

import type {
  ConfigurationManager,
} from "../configuration/configuration-manager.js";

import type {
  Configuration,
} from "../configuration/configuration.js";

import type {
  Logger,
} from "../logging/logger.js";

import type {
  LifecycleScope,
} from "../lifecycle/lifecycle-scope.js";

import type {
  Module,
  ModuleId,
  ModuleOptions,
} from "./module.js";

import type {
  ModuleDefinition,
} from "./module-definition.js";

import type {
  ModuleMetadata,
} from "./module-metadata.js";

/**
 * Dependencies exposed to a module through its context.
 *
 * This is intentionally a narrow interface. The module should
 * receive capabilities, not unrestricted access to the runtime.
 */
export interface ModuleContextDependencies {
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
   * Module-scoped logger.
   */
  readonly logger:
    Logger;
}

/**
 * Immutable information describing the current module.
 */
export interface ModuleContextInfo {
  /**
   * Module identifier.
   */
  readonly id: ModuleId;

  /**
   * Module name.
   */
  readonly name: string;

  /**
   * Module version.
   */
  readonly version?: string;

  /**
   * Module metadata.
   */
  readonly metadata?:
    ModuleMetadata;

  /**
   * Module options.
   */
  readonly options:
    ModuleOptions;

  /**
   * Lifecycle scope.
   */
  readonly scope?:
    LifecycleScope;
}

/**
 * Context supplied to a module during its lifecycle.
 *
 * ModuleContext is deliberately narrower than ApplicationContext.
 * It gives modules controlled access to framework capabilities.
 */
export interface ModuleContext
  extends ModuleContextInfo {
  /**
   * Application-level context.
   *
   * This is exposed as a typed capability rather than requiring
   * modules to import and manipulate the application directly.
   */
  readonly application:
    ApplicationContext;

  /**
   * Configuration manager.
   */
  readonly configuration:
    ConfigurationManager;

  /**
   * Logger scoped to this module.
   */
  readonly logger:
    Logger;

  /**
   * Gets the current configuration snapshot.
   */
  getConfiguration():
    Configuration;

  /**
   * Gets a configuration value.
   */
  getConfig<T = unknown>(
    path: string,
  ): T | undefined;

  /**
   * Gets a required configuration value.
   */
  requireConfig<T = unknown>(
    path: string,
  ): T;

  /**
   * Returns another module's context.
   *
   * This should only be used for declared module dependencies.
   */
  getModuleContext(
    moduleId: ModuleId,
  ):
    ModuleContext | undefined;

  /**
   * Returns whether another module is available.
   */
  hasModule(
    moduleId: ModuleId,
  ): boolean;
}

/**
 * Internal implementation of ModuleContext.
 *
 * The public ModuleContext interface is intentionally small,
 * while this implementation owns the actual state.
 */
export class DefaultModuleContext
  implements ModuleContext {
  public readonly id: ModuleId;

  public readonly name: string;

  public readonly version?: string;

  public readonly metadata?:
    ModuleMetadata;

  public readonly options:
    ModuleOptions;

  public readonly scope?:
    LifecycleScope;

  public readonly application:
    ApplicationContext;

  public readonly configuration:
    ConfigurationManager;

  public readonly logger:
    Logger;

  private readonly moduleContexts:
    ReadonlyMap<
      ModuleId,
      ModuleContext
    >;

  public constructor(
    module: Module,
    dependencies:
      ModuleContextDependencies,
    metadata?: ModuleMetadata,
    moduleContexts:
      ReadonlyMap<
        ModuleId,
        ModuleContext
      > = new Map(),
  ) {
    this.id =
      module.id;

    this.name =
      module.name;

    this.version =
      module.version;

    this.metadata =
      metadata;

    this.options =
      Object.freeze({
        ...(module.options ?? {}),
      });

    this.scope =
      module.scope;

    this.application =
      dependencies.application;

    this.configuration =
      dependencies.configuration;

    this.logger =
      dependencies.logger;

    this.moduleContexts =
      moduleContexts;
  }

  /**
   * Returns the current configuration.
   */
  public getConfiguration():
    Configuration {
    return this.configuration
      .getConfiguration();
  }

  /**
   * Gets an optional configuration value.
   */
  public getConfig<T = unknown>(
    path: string,
  ): T | undefined {
    return this.configuration.get<T>(
      path,
    );
  }

  /**
   * Gets a required configuration value.
   */
  public requireConfig<T = unknown>(
    path: string,
  ): T {
    return this.configuration.require<T>(
      path,
    );
  }

  /**
   * Gets the context of another module.
   */
  public getModuleContext(
    moduleId: ModuleId,
  ):
    ModuleContext | undefined {
    return this.moduleContexts.get(
      moduleId,
    );
  }

  /**
   * Checks whether another module exists.
   */
  public hasModule(
    moduleId: ModuleId,
  ): boolean {
    return this.moduleContexts.has(
      moduleId,
    );
  }
}

/**
 * Options used to create a module context.
 */
export interface CreateModuleContextOptions {
  /**
   * Module instance.
   */
  readonly module: Module;

  /**
   * Application-level dependencies.
   */
  readonly dependencies:
    ModuleContextDependencies;

  /**
   * Optional metadata associated with the module.
   */
  readonly metadata?:
    ModuleMetadata;

  /**
   * Contexts of modules that have already been resolved.
   */
  readonly moduleContexts?:
    ReadonlyMap<
      ModuleId,
      ModuleContext
    >;
}

/**
 * Creates a module context.
 */
export function createModuleContext(
  options: CreateModuleContextOptions,
): ModuleContext {
  return new DefaultModuleContext(
    options.module,
    options.dependencies,
    options.metadata,
    options.moduleContexts,
  );
}

/**
 * Type guard for ModuleContext.
 */
export function isModuleContext(
  value: unknown,
): value is ModuleContext {
  if (
    value === null ||
    typeof value !== "object"
  ) {
    return false;
  }

  const context =
    value as Partial<
      ModuleContext
    >;

  return (
    typeof context.id ===
      "string" &&
    typeof context.name ===
      "string" &&
    typeof context.getConfig ===
      "function" &&
    typeof context.requireConfig ===
      "function"
  );
}