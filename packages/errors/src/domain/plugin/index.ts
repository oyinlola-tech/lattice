export {
  PluginError,
  PluginRegistrationError,
  PluginAlreadyRegisteredError,
  PluginNotFoundError,
  PluginDependencyError,
  PluginDependencyCycleError,
  PluginInitializationError,
  PluginStartError,
  PluginStopError,
  PluginDisposeError,
  PluginTimeoutError,
  PluginStateError,
  createPluginError,
  isPluginError,
} from "./plugin.error.js";

export type { PluginErrorOptions } from "./plugin.error.js";
