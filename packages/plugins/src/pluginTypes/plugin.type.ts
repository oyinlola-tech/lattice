import type { PluginMetadata } from "./pluginMetadata.type.js";
import type { PluginDependency } from "./pluginDependency.type.js";
import type { PluginContext } from "./pluginContext.type.js";

/**
 * Plugin interface definition.
 */
export interface Plugin<TOptions = unknown> {
  readonly metadata: PluginMetadata;

  readonly dependencies?: readonly PluginDependency[];

  readonly optionalDependencies?: readonly PluginDependency[];

  install?(context: PluginContext, options: TOptions): void | Promise<void>;

  initialize?(context: PluginContext): void | Promise<void>;

  start?(context: PluginContext): void | Promise<void>;

  stop?(context: PluginContext): void | Promise<void>;

  dispose?(context: PluginContext): void | Promise<void>;
}
