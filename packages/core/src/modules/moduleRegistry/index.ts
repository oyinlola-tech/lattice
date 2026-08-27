/**
 * Module Registry
 *
 * Stores module definitions and tracks their runtime state.
 */

export {
  type ModuleRegistrationState,
  type ModuleRegistration,
  type ModuleRegistryOptions,
  type ModuleRegistryEventType,
  type ModuleRegistryEvent,
  type ModuleRegistryListener,
  type ModuleRegistry,
} from "./moduleRegistry.type.js";

export {
  DefaultModuleRegistry,
  createModuleRegistry,
  isModuleRegistration,
} from "./moduleRegistry.registry.js";
