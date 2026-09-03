import type { ApplicationContext } from "../../application/applicationContext.context.js";

import type { ConfigurationManager } from "../../configuration/configurationManager.manager.js";

import type { Logger } from "../../logging/core/logger.js";

import type { ModuleId } from "../module.js";

/**
 * Options used by the module loader.
 */
export interface ModuleLoaderOptions {
  /**
   * Application context supplied to modules.
   */
  readonly application: ApplicationContext;

  /**
   * Configuration manager.
   */
  readonly configuration: ConfigurationManager;

  /**
   * Base logger used to create module-scoped loggers.
   */
  readonly logger: Logger;

  /**
   * Whether modules marked `autoLoad: false` should
   * still be loaded when explicitly requested.
   *
   * Defaults to true.
   */
  readonly allowExplicitLoad?: boolean;
}

/**
 * Result returned after loading modules.
 */
export interface ModuleLoadResult {
  /**
   * Modules successfully loaded.
   */
  readonly loaded: readonly import("../module.js").Module[];

  /**
   * Modules that were already loaded.
   */
  readonly alreadyLoaded: readonly import("../module.js").Module[];

  /**
   * Modules skipped because auto loading was disabled.
   */
  readonly skipped: readonly ModuleId[];

  /**
   * Startup order used by the loader.
   */
  readonly order: readonly ModuleId[];
}

import { ModuleLoadError as BaseModuleLoadError } from "@zudolib/errors";

/**
 * Error thrown when one or more modules cannot be loaded.
 */
export class ModuleLoadError extends BaseModuleLoadError {
  public constructor(moduleId: ModuleId, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);

    super(moduleId, `Failed to load module "${moduleId}": ${message}`, cause);
  }
}
