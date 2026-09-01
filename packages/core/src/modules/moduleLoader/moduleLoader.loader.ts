import type { ApplicationContext } from "../../application/applicationContext.context.js";
import type { ConfigurationManager } from "../../configuration/configurationManager.manager.js";
import type { Logger } from "../../logging/core/logger.js";
import type { Module, ModuleId } from "../module.js";
import type { ModuleContext } from "../moduleContext.context.js";
import { createModuleContext } from "../moduleContext.context.js";
import type { ModuleDefinition } from "../moduleDefinition.definition.js";
import type { ModuleRegistry } from "../moduleRegistry/index.js";
import type { ModuleRegistration } from "../moduleRegistry/moduleRegistry.type.js";
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
import { ModuleLoadError } from "./moduleLoader.type.js";

/**
 * Default module loader.
 *
 * Reads definitions from registry, builds dependency graph,
 * validates, resolves startup order, instantiates modules.
 */
export class ModuleLoader {
  private readonly application: ApplicationContext;
  private readonly configuration: ConfigurationManager;
  private readonly logger: Logger;
  private readonly registry: ModuleRegistry;
  private readonly allowExplicitLoad: boolean;
  private readonly contexts = new Map<ModuleId, ModuleContext>();

  public constructor(registry: ModuleRegistry, options: ModuleLoaderOptions) {
    this.registry = registry;
    this.application = options.application;
    this.configuration = options.configuration;
    this.logger = options.logger;
    this.allowExplicitLoad = options.allowExplicitLoad ?? true;
  }

  /** Loads every module whose definition has autoLoad enabled. */
  public async loadAll(): Promise<ModuleLoadResult> {
    const definitions = this.registry
      .getDefinitions()
      .filter((d) => d.autoLoad !== false);
    return this.loadDefinitions(definitions);
  }

  /** Loads a specific module and all of its required dependencies. */
  public async load(moduleId: ModuleId): Promise<Module> {
    const registration = this.registry.require(moduleId);
    if (registration.state === "loaded" && registration.instance)
      return registration.instance;

    if (registration.definition.autoLoad === false && !this.allowExplicitLoad) {
      throw new ModuleLoadError(
        moduleId,
        new Error(
          `Module "${moduleId}" is not configured for explicit loading.`,
        ),
      );
    }

    const definitions = this.collectDependencies(moduleId);
    await this.loadDefinitions(definitions);

    const loaded = this.registry.require(moduleId);
    if (!loaded.instance)
      throw new ModuleLoadError(
        moduleId,
        new Error("Module was not instantiated."),
      );
    return loaded.instance;
  }

  private async loadDefinitions(
    definitions: readonly ModuleDefinition[],
  ): Promise<ModuleLoadResult> {
    if (definitions.length === 0)
      return { loaded: [], alreadyLoaded: [], skipped: [], order: [] };

    const graph = this.createGraph(definitions);
    const missing = validateModuleDependencyGraph(graph);
    if (missing.length > 0)
      throw new ModuleLoadError(
        "module-dependencies",
        new Error(`Missing required modules: ${missing.join(", ")}`),
      );

    const order = resolveModuleStartupOrder(graph);
    const loaded: Module[] = [];
    const alreadyLoaded: Module[] = [];
    const skipped: ModuleId[] = [];

    for (const moduleId of order) {
      const registration = this.registry.get(moduleId);
      if (!registration)
        throw new ModuleLoadError(
          moduleId,
          new Error(
            `Module "${moduleId}" disappeared from the registry during loading.`,
          ),
        );
      if (registration.state === "loaded" && registration.instance) {
        alreadyLoaded.push(registration.instance);
        continue;
      }
      if (
        registration.definition.autoLoad === false &&
        !this.isExplicitlyRequested(moduleId, definitions)
      ) {
        skipped.push(moduleId);
        continue;
      }

      const instance = await this.instantiate(registration.definition);
      loaded.push(instance);
    }

    return {
      loaded: Object.freeze([...loaded]),
      alreadyLoaded: Object.freeze([...alreadyLoaded]),
      skipped: Object.freeze([...skipped]),
      order: Object.freeze([...order]),
    };
  }

  private createGraph(
    definitions: readonly ModuleDefinition[],
  ): ModuleDependencyGraph {
    const nodes: ModuleDependencyNode[] = definitions.map((d) => ({
      id: d.id,
      dependencies: this.registry.getDependencies(d.id),
    }));
    return createModuleDependencyGraph(nodes);
  }

  private collectDependencies(moduleId: ModuleId): readonly ModuleDefinition[] {
    const collected = new Map<ModuleId, ModuleDefinition>();

    const visit = (currentId: ModuleId): void => {
      if (collected.has(currentId)) return;
      const registration = this.registry.require(currentId);
      collected.set(currentId, registration.definition);

      for (const dependency of this.registry.getDependencies(currentId)) {
        if (dependency.optional && !this.registry.has(dependency.id)) continue;
        if (this.registry.has(dependency.id)) visit(dependency.id);
      }
    };

    visit(moduleId);
    return Object.freeze([...collected.values()]);
  }

  private async instantiate(definition: ModuleDefinition): Promise<Module> {
    const moduleId = definition.id;
    this.registry.setState(moduleId, "loading");

    try {
      const module = await definition.factory(definition.options);
      if (!module || typeof module !== "object")
        throw new TypeError(
          `Module factory for "${moduleId}" did not return a valid module.`,
        );
      if (module.id !== moduleId)
        throw new TypeError(
          `Module factory returned module "${module.id}" but expected "${moduleId}".`,
        );

      if (typeof module.attach === "function") module.attach(this.application);

      const moduleLogger = this.createModuleLogger(module);
      const context = createModuleContext({
        module,
        dependencies: {
          application: this.application,
          configuration: this.configuration,
          logger: moduleLogger,
        },
        metadata: definition.metadata,
        moduleContexts: this.contexts,
      });

      this.contexts.set(moduleId, context);
      this.registry.setState(moduleId, "loaded", { instance: module });
      return module;
    } catch (error) {
      this.registry.setState(moduleId, "failed", { error });
      throw new ModuleLoadError(moduleId, error);
    }
  }

  private createModuleLogger(module: Module): Logger {
    const logger = this.logger as Logger & {
      child?: (context: Record<string, unknown>) => Logger;
    };
    if (typeof logger.child === "function")
      return logger.child({ moduleId: module.id, module: module.name });
    return this.logger;
  }

  private isExplicitlyRequested(
    moduleId: ModuleId,
    definitions: readonly ModuleDefinition[],
  ): boolean {
    return definitions.some((d) => d.id === moduleId);
  }

  public getContext(moduleId: ModuleId): ModuleContext | undefined {
    return this.contexts.get(moduleId);
  }

  public requireContext(moduleId: ModuleId): ModuleContext {
    const context = this.getContext(moduleId);
    if (!context) throw new Error(`Module "${moduleId}" has not been loaded.`);
    return context;
  }

  public getContexts(): ReadonlyMap<ModuleId, ModuleContext> {
    return new Map(this.contexts);
  }
  public isLoaded(moduleId: ModuleId): boolean {
    return this.registry.get(moduleId)?.state === "loaded";
  }
}

/** Creates a module loader. */
export function createModuleLoader(
  registry: ModuleRegistry,
  options: ModuleLoaderOptions,
): ModuleLoader {
  return new ModuleLoader(registry, options);
}
