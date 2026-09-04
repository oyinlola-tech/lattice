import type { Plugin } from "../pluginTypes/plugin.type.js";
import type { PluginContext } from "../pluginTypes/pluginContext.type.js";
import type { PluginRegistry } from "../pluginRegistry/pluginRegistry.core.js";
import type { DependencyResolution } from "../pluginDependencies/dependencyResolver.core.js";
import type { PluginDependency } from "../pluginTypes/pluginDependency.type.js";
import { PluginRegistryImpl } from "../pluginRegistry/pluginRegistry.core.js";
import {
  DependencyResolver,
  assertResolutionValid,
} from "../pluginDependencies/dependencyResolver.core.js";
import { LifecycleController } from "../pluginLifecycle/pluginLifecycle.core.js";
import {
  PluginAlreadyRegisteredError,
  PluginDependencyCycleError,
  PluginDependencyError,
  PluginInitializationError,
  PluginNotFoundError,
  PluginRegistrationError,
} from "@zudojs/errors";
import { PLUGIN_EVENTS } from "../pluginEvents/pluginEvent.core.js";
import {
  buildDiagnosticReport,
  createHealthyHealth,
  createUnhealthyHealth,
} from "../pluginDiagnostics/pluginDiagnostic.core.js";
import type { PluginDiagnosticReport } from "../pluginDiagnostics/pluginDiagnostic.core.js";

/**
 * Plugin manager coordinates registration, dependency resolution, lifecycle, and disposal.
 */
export class PluginManager {
  private readonly registry: PluginRegistry;

  private readonly resolver: DependencyResolver;

  private readonly lifecycle: LifecycleController;

  private readonly plugins: Map<string, Plugin> = new Map();

  constructor() {
    this.registry = new PluginRegistryImpl();
    this.resolver = new DependencyResolver();
    this.lifecycle = new LifecycleController();
  }

  public register<TPlugin extends Plugin>(plugin: TPlugin): void {
    try {
      this.registry.register(plugin);
      this.plugins.set(plugin.metadata.name, plugin);
    } catch (error) {
      throw new PluginRegistrationError(
        (error as Error).message,
        plugin.metadata.name,
      );
    }
  }

  public get<TPlugin extends Plugin>(name: string): TPlugin | undefined {
    return this.registry.get<TPlugin>(name)?.plugin;
  }

  public has(name: string): boolean {
    return this.registry.has(name);
  }

  public list(): readonly Plugin[] {
    return this.registry.list().map((r) => r.plugin);
  }

  public async start(context: PluginContext): Promise<void> {
    const resolution = this.resolver.resolve(this.toDependencyMap());
    assertResolutionValid(resolution);

    const ordered = resolution.ordered;

    for (const name of ordered) {
      const registered = this.registry.get(name);
      if (!registered || registered.state === "disposed") {
        continue;
      }

      await this.lifecycle.install(registered, context);
    }

    for (const name of ordered) {
      const registered = this.registry.get(name);
      if (!registered || registered.state === "disposed") {
        continue;
      }

      if (registered.state === "installed") {
        await this.lifecycle.initialize(registered, context);
      }
    }

    for (const name of ordered) {
      const registered = this.registry.get(name);
      if (!registered || registered.state === "disposed") {
        continue;
      }

      if (registered.state === "initialized") {
        await this.lifecycle.start(registered, context);
      }
    }
  }

  public async stop(context: PluginContext): Promise<void> {
    const plugins = this.registry.list();
    const reversed = [...plugins].reverse();

    for (const registered of reversed) {
      if (registered.state === "started") {
        try {
          await this.lifecycle.stop(registered, context);
        } catch {
          continue;
        }
      }
    }

    for (const registered of reversed) {
      if (registered.state === "stopped" || registered.state === "failed") {
        try {
          await this.lifecycle.dispose(registered, context);
        } catch {
          continue;
        }
      }
    }
  }

  public diagnostics(): PluginDiagnosticReport {
    const plugins = this.registry.list().map((registered) => ({
      plugin: registered.plugin,
      state: registered.state,
    }));

    return buildDiagnosticReport(plugins);
  }

  private toDependencyMap(): Map<
    string,
    {
      readonly dependencies?: readonly PluginDependency[];
      readonly optionalDependencies?: readonly PluginDependency[];
    }
  > {
    const map = new Map<
      string,
      {
        readonly dependencies?: readonly PluginDependency[];
        readonly optionalDependencies?: readonly PluginDependency[];
      }
    >();

    for (const [name, plugin] of this.plugins) {
      map.set(name, {
        dependencies: plugin.dependencies,
        optionalDependencies: plugin.optionalDependencies,
      });
    }

    return map;
  }
}
