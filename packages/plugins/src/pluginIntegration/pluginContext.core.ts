import type { PluginMetadata } from "../pluginTypes/pluginMetadata.type.js";
import type { PluginContext } from "../pluginTypes/pluginContext.type.js";
import type { PluginContainer } from "../pluginTypes/pluginContext.type.js";
import type { PluginConfig } from "../pluginTypes/pluginContext.type.js";
import type { PluginLogger } from "../pluginTypes/pluginContext.type.js";
import type { PluginEvents } from "../pluginTypes/pluginContext.type.js";

/**
 * Options for creating a plugin context.
 */
export interface CreatePluginContextOptions {
  readonly container?: PluginContainer;

  readonly config?: PluginConfig;

  readonly logger?: PluginLogger;

  readonly events?: PluginEvents;
}

/**
 * Creates a plugin context for testing and basic usage.
 */
export function createPluginContext(
  plugin: PluginMetadata,
  options: CreatePluginContextOptions = {},
): PluginContext {
  const abortController = new AbortController();
  const disposables: Array<{ dispose(): void | Promise<void> }> = [];

  return {
    plugin,
    signal: abortController.signal,
    container: options.container,
    config: options.config,
    logger: options.logger,
    events: options.events,
    onDispose(handler) {
      disposables.push({ dispose: handler });
    },
    registerDisposable(disposable) {
      disposables.push(disposable);
    },
  };
}
