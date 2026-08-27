import type {
  ApplicationContext,
} from "../../application/applicationContext.context.js";

import type {
  ConfigurationManager,
} from "../../configuration/configurationManager.manager.js";

import type {
  Logger,
} from "../../logging/core/logger.js";

import type {
  Module,
  ModuleId,
} from "../module.js";

import type {
  ModuleContext,
} from "../moduleContext.context.js";

import {
  createModuleContext,
} from "../moduleContext.context.js";

import type {
  ModuleDefinition,
} from "../moduleDefinition.definition.js";

import type {
  ModuleRegistry,
} from "../moduleRegistry/index.js";

import type {
  ModuleRegistration,
} from "../moduleRegistry/moduleRegistry.type.js";

import {
  createModuleDependencyGraph,
  resolveModuleStartupOrder,
  validateModuleDependencyGraph,
} from "../moduleDependency/index.js";

import type {
  ModuleDependencyGraph,
  ModuleDependencyNode,
} from "../moduleDependency/moduleDependency.type.js";

import type {
  ModuleLoaderOptions,
  ModuleLoadResult,
} from "./moduleLoader.type.js";

import {
  ModuleLoadError,
} from "./moduleLoader.type.js";

/**
 * Default module loader.
 *
 * Responsibilities:
 *
 * 1. Read definitions from the registry.
 * 2. Build the dependency graph.
 * 3. Validate dependencies.
 * 4. Resolve a deterministic startup order.
 * 5. Instantiate modules.
 * 6. Attach modules to the application.
 * 7. Create module contexts.
 * 8. Update registry state.
 *
 * Lifecycle hooks are intentionally handled elsewhere.
 */
export class ModuleLoader {
  private readonly application:
    ApplicationContext;

  private readonly configuration:
    ConfigurationManager;

  private readonly logger:
    Logger;

  private readonly registry:
    ModuleRegistry;

  private readonly allowExplicitLoad:
    boolean;

  private readonly contexts =
    new Map<
      ModuleId,
      ModuleContext
    >();

  public constructor(
    registry: ModuleRegistry,
    options: ModuleLoaderOptions,
  ) {
    this.registry =
      registry;

    this.application =
      options.application;

    this.configuration =
      options.configuration;

    this.logger =
      options.logger;

    this.allowExplicitLoad =
      options.allowExplicitLoad ??
      true;
  }

  /**
   * Loads every module whose definition has autoLoad enabled.
   */
  public async loadAll(): Promise<ModuleLoadResult> {
    const definitions =
      this.registry
        .getDefinitions()
        .filter(
          (definition) =>
            definition.autoLoad !==
            false,
        );

    return this.loadDefinitions(
      definitions,
    );
  }

  /**
   * Loads a specific module and all of its required dependencies.
   */
  public async load(
    moduleId: ModuleId,
  ): Promise<Module> {
    const registration =
      this.registry.require(
        moduleId,
      );

    if (
      registration.state ===
        "loaded" &&
      registration.instance
    ) {
      return registration.instance;
    }

    const definition =
      registration.definition;

    if (
      definition.autoLoad ===
        false &&
      !this.allowExplicitLoad
    ) {
      throw new ModuleLoadError(
        moduleId,
        new Error(
          `Module "${moduleId}" is not configured for explicit loading.`,
        ),
      );
    }

    const definitions =
      this.collectDependencies(
        moduleId,
      );

    await this.loadDefinitions(
      definitions,
    );

    const loaded =
      this.registry.require(
        moduleId,
      );

    if (
      !loaded.instance
    ) {
      throw new ModuleLoadError(
        moduleId,
        new Error(
          "Module was not instantiated.",
        ),
      );
    }

    return loaded.instance;
  }

  /**
   * Loads a collection of module definitions.
   */
  private async loadDefinitions(
    definitions:
      readonly ModuleDefinition[],
  ): Promise<ModuleLoadResult> {
    if (
      definitions.length ===
      0
    ) {
      return {
        loaded: [],
        alreadyLoaded: [],
        skipped: [],
        order: [],
      };
    }

    const graph =
      this.createGraph(
        definitions,
      );

    const missing =
      validateModuleDependencyGraph(
        graph,
      );

    if (
      missing.length > 0
    ) {
      throw new ModuleLoadError(
        "module-dependencies",
        new Error(
          `Missing required modules: ${missing.join(", ")}`,
        ),
      );
    }

    const order =
      resolveModuleStartupOrder(
        graph,
      );

    const loaded:
      Module[] =
      [];

    const alreadyLoaded:
      Module[] =
      [];

    const skipped:
      ModuleId[] =
      [];

    for (
      const moduleId of order
    ) {
      const registration =
        this.registry.get(
          moduleId,
        );

      if (!registration) {
        throw new ModuleLoadError(
          moduleId,
          new Error(
            `Module "${moduleId}" disappeared from the registry during loading.`,
          ),
        );
      }

      if (
        registration.state ===
          "loaded" &&
        registration.instance
      ) {
        alreadyLoaded.push(
          registration.instance,
        );

        continue;
      }

      if (
        registration.definition
          .autoLoad === false &&
        !this.isExplicitlyRequested(
          moduleId,
          definitions,
        )
      ) {
        skipped.push(
          moduleId,
        );

        continue;
      }

      const instance =
        await this.instantiate(
          registration.definition,
        );

      loaded.push(
        instance,
      );
    }

    return {
      loaded:
        Object.freeze([
          ...loaded,
        ]),

      alreadyLoaded:
        Object.freeze([
          ...alreadyLoaded,
        ]),

      skipped:
        Object.freeze([
          ...skipped,
        ]),

      order:
        Object.freeze([
          ...order,
        ]),
    };
  }

  /**
   * Creates a dependency graph for the supplied definitions.
   */
  private createGraph(
    definitions:
      readonly ModuleDefinition[],
  ): ModuleDependencyGraph {
    const nodes:
      ModuleDependencyNode[] =
      definitions.map(
        (definition) => ({
          id:
            definition.id,

          dependencies:
            this.registry.getDependencies(
              definition.id,
            ),
        }),
      );

    return createModuleDependencyGraph(
      nodes,
    );
  }

  /**
   * Recursively collects the target module and all definitions
   * required to load it.
   */
  private collectDependencies(
    moduleId: ModuleId,
  ): readonly ModuleDefinition[] {
    const collected =
      new Map<
        ModuleId,
        ModuleDefinition
      >();

    const visit = (
      currentId: ModuleId,
    ): void => {
      if (
        collected.has(
          currentId,
        )
      ) {
        return;
      }

      const registration =
        this.registry.require(
          currentId,
        );

      collected.set(
        currentId,
        registration.definition,
      );

      for (
        const dependency of
          this.registry.getDependencies(
            currentId,
          )
      ) {
        if (
          dependency.optional &&
          !this.registry.has(
            dependency.id,
          )
        ) {
          continue;
        }

        if (
          this.registry.has(
            dependency.id,
          )
        ) {
          visit(
            dependency.id,
          );
        }
      }
    };

    visit(moduleId);

    return Object.freeze([
      ...collected.values(),
    ]);
  }

  /**
   * Instantiates a single module.
   */
  private async instantiate(
    definition:
      ModuleDefinition,
  ): Promise<Module> {
    const moduleId =
      definition.id;

    this.registry.setState(
      moduleId,
      "loading",
    );

    try {
      const module =
        await definition.factory(
          definition.options,
        );

      if (
        !module ||
        typeof module !==
          "object"
      ) {
        throw new TypeError(
          `Module factory for "${moduleId}" did not return a valid module.`,
        );
      }

      if (
        module.id !==
        moduleId
      ) {
        throw new TypeError(
          `Module factory returned module "${module.id}" but expected "${moduleId}".`,
        );
      }

      if (
        typeof module.attach ===
          "function"
      ) {
        module.attach(
          this.application,
        );
      }

      const moduleLogger =
        this.createModuleLogger(
          module,
        );

      const context =
        createModuleContext({
          module,

          dependencies: {
            application:
              this.application,

            configuration:
              this.configuration,

            logger:
              moduleLogger,
          },

          metadata:
            definition.metadata,

          moduleContexts:
            this.contexts,
        });

      this.contexts.set(
        moduleId,
        context,
      );

      this.registry.setState(
        moduleId,
        "loaded",
        {
          instance:
            module,
        },
      );

      return module;
    } catch (error) {
      this.registry.setState(
        moduleId,
        "failed",
        {
          error,
        },
      );

      throw new ModuleLoadError(
        moduleId,
        error,
      );
    }
  }

  /**
   * Creates a logger scoped to the module.
   *
   * The Logger abstraction is intentionally used here instead
   * of importing a concrete logging implementation.
   */
  private createModuleLogger(
    module: Module,
  ): Logger {
    /**
     * The core Logger contract is expected to provide a
     * child/scope operation. If the implementation does not
     * expose one yet, the base logger remains usable.
     */
    const logger =
      this.logger as Logger & {
        child?: (
          context: Record<
            string,
            unknown
          >,
        ) => Logger;
      };

    if (
      typeof logger.child ===
      "function"
    ) {
      return logger.child({
        moduleId:
          module.id,

        module:
          module.name,
      });
    }

    return this.logger;
  }

  /**
   * Determines whether a definition was explicitly requested.
   */
  private isExplicitlyRequested(
    moduleId: ModuleId,
    definitions:
      readonly ModuleDefinition[],
  ): boolean {
    return definitions.some(
      (definition) =>
        definition.id ===
        moduleId,
    );
  }

  /**
   * Returns the context for a loaded module.
   */
  public getContext(
    moduleId: ModuleId,
  ):
    | ModuleContext
    | undefined {
    return this.contexts.get(
      moduleId,
    );
  }

  /**
   * Returns a required module context.
   */
  public requireContext(
    moduleId: ModuleId,
  ): ModuleContext {
    const context =
      this.getContext(
        moduleId,
      );

    if (!context) {
      throw new Error(
        `Module "${moduleId}" has not been loaded.`,
      );
    }

    return context;
  }

  /**
   * Returns all loaded module contexts.
   */
  public getContexts():
    ReadonlyMap<
      ModuleId,
      ModuleContext
    > {
    return new Map(
      this.contexts,
    );
  }

  /**
   * Returns whether a module has been loaded.
   */
  public isLoaded(
    moduleId: ModuleId,
  ): boolean {
    return (
      this.registry.get(
        moduleId,
      )?.state ===
      "loaded"
    );
  }
}

/**
 * Creates a module loader.
 */
export function createModuleLoader(
  registry: ModuleRegistry,
  options: ModuleLoaderOptions,
): ModuleLoader {
  return new ModuleLoader(
    registry,
    options,
  );
}
