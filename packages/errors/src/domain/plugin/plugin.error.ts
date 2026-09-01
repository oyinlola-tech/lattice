/**
 * Plugin error classes — re-exports from focused files.
 */

export {
  PluginError,
  createPluginError,
  isPluginError,
} from "./pluginError.base.js";
export type { PluginErrorOptions } from "./pluginError.base.js";

export {
  PluginRegistrationError,
  PluginAlreadyRegisteredError,
  PluginNotFoundError,
  PluginDependencyError,
  PluginDependencyCycleError,
  PluginInitializationError,
  PluginStartError,
  PluginStopError,
  PluginDisposeError,
} from "./pluginError.lifecycle.js";

export { PluginTimeoutError, PluginStateError } from "./pluginError.runtime.js";
