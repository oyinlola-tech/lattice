/**
 * @lattice/config
 *
 * Configuration management for the Lattice platform.
 */

export {
  ConfigManager,
  ConfigManagerState,
  createConfigManager,
  initializeConfigManager,
  ConfigManagerValidationError,
} from "./config-manager.js";

export type {
  ConfigManagerOptions,
  ConfigManagerStatus,
  ConfigManagerListener,
} from "./config-manager.js";

export {
  ConfigStore,
  normalizeKey,
} from "./config-store.js";

export type {
  ConfigStoreOptions,
  ConfigChangeEvent,
  ConfigChangeListener,
} from "./config-store.js";

export {
  ConfigResolver,
  ScopedConfigResolver,
  createConfigResolver,
} from "./config-resolver.js";

export type {
  ConfigResolverOptions,
  ConfigResolutionResult,
} from "./config-resolver.js";

export {
  ConfigLoader,
  createConfigLoader,
  loadConfiguration,
} from "./config-loader.js";

export type {
  ConfigLoaderOptions,
  ConfigLoadResult,
} from "./config-loader.js";

export {
  ConfigValueType,
  ConfigValidationSeverity,
  validateConfigObject,
} from "./config-schema.js";

export type {
  ConfigValidationIssue,
  ConfigValidationResult,
  ConfigValidationContext,
  ConfigSchema,
} from "./config-schema.js";

export {
  ConfigSourceType,
  createConfigSource,
} from "./config-source.js";

export type {
  ConfigSourceEntry,
  ConfigSourceContext,
  ConfigSourceResult,
  ConfigSource,
  ConfigSourceType as ConfigSourceTypeValue,
} from "./config-source.js";

export {
  createConfigEntry,
  updateConfigEntry,
  isConfigEntry,
} from "./config-entry.js";

export type {
  ConfigEntry,
  ConfigEntryOptions,
} from "./config-entry.js";

export {
  isConfigPrimitive,
  isConfigValue,
  cloneConfigValue,
  freezeConfigValue,
  configValueToString,

} from "./config-value.js";

export type {
  ConfigPrimitive,
  ConfigJsonValue,
  ConfigValue,
  ResolvedConfigValue,
} from "./config-value.js";
