/**
 * @oyinlola141/lattice-core/configuration/core
 *
 * Core configuration types, keys, and source abstractions.
 */

export { Configuration, createConfiguration } from "./configuration.js";

export type {
  ConfigurationOptions,
  ConfigurationValue,
  ConfigurationSource as ConfigurationValueSource,
  ConfigurationEntry,
} from "./configuration.js";

export { createConfigurationKey } from "./configurationKey.key.js";

export type { ConfigurationKey } from "./configurationKey.key.js";

export {
  BaseConfigurationSource,
  createConfigurationSource,
  sortConfigurationSources,
} from "./configurationSource.source.js";

export type {
  ConfigurationSource,
  ConfigurationSourceType,
  ConfigurationSourceEntry,
  ConfigurationSourceOptions,
} from "./configurationSource.source.js";
