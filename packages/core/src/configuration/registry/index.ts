/**
 * @oyinlola141/lattice-core/configuration/registry
 *
 * Configuration registry and provider.
 */

export {
  ConfigurationRegistry,
  createConfigurationRegistry,
} from "./configurationRegistry.registry.js";

export type {
  ConfigurationSection,
  ConfigurationSectionOptions,
} from "./configurationRegistry.registry.js";

export {
  DefaultConfigurationProvider,
  createConfigurationProvider,
} from "./configurationProvider.provider.js";

export type {
  ConfigurationProvider,
  ConfigurationProviderOptions,
} from "./configurationProvider.provider.js";
