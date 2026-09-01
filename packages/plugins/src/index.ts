/**
 * @oyinlola141/lattice-plugins
 *
 * Controlled extension system for the Lattice framework.
 *
 * Provides plugin registration, dependency resolution, lifecycle management,
 * and orchestration for Lattice applications.
 *
 * @example
 * ```ts
 * import { PluginManager, createPluginContext } from "@oyinlola141/lattice-plugins";
 *
 * const manager = new PluginManager();
 *
 * manager.register({
 *   metadata: { name: "@oyinlola141/lattice-http" },
 *   dependencies: [{ name: "@oyinlola141/lattice-events" }],
 *   async install(context) {
 *     // register services
 *   },
 *   async start(context) {
 *     // begin active work
 *   },
 * });
 *
 * await manager.start(createPluginContext({ metadata: { name: "@oyinlola141/lattice-http" } }));
 * ```
 */

export { PluginManager } from "./pluginManager/pluginManager.core.js";

export { PluginRegistryImpl } from "./pluginRegistry/pluginRegistry.core.js";
export type {
  PluginRegistry,
  RegisteredPlugin,
} from "./pluginRegistry/pluginRegistry.core.js";

export {
  DependencyResolver,
  assertResolutionValid,
} from "./pluginDependencies/dependencyResolver.core.js";
export type { DependencyResolution } from "./pluginDependencies/dependencyResolver.core.js";

export { LifecycleController } from "./pluginLifecycle/pluginLifecycle.core.js";

export {
  PLUGIN_EVENTS,
  createPluginLifecycleEvent,
} from "./pluginEvents/pluginEvent.core.js";
export type { PluginLifecycleEvent } from "./pluginEvents/pluginEvent.core.js";

export {
  buildDiagnosticReport,
  createHealthyHealth,
  createDegradedHealth,
  createUnhealthyHealth,
} from "./pluginDiagnostics/pluginDiagnostic.core.js";
export type {
  PluginHealth,
  PluginHealthStatus,
  PluginDiagnostic,
  PluginDiagnosticReport,
} from "./pluginDiagnostics/pluginDiagnostic.core.js";

export {
  isValidTransition,
  VALID_STATE_TRANSITIONS,
} from "./pluginTypes/pluginState.type.js";

export { createPluginContext } from "./pluginIntegration/pluginContext.core.js";
export type { CreatePluginContextOptions } from "./pluginIntegration/pluginContext.core.js";

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
} from "@oyinlola141/lattice-errors";

export type {
  PluginState,
  PluginMetadata,
  PluginDependency,
  PluginContext,
  Plugin,
  PluginErrorOptions,
} from "./pluginTypes/index.js";
