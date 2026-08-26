import type { ConfigValue } from "./config-value.js";
import type { ConfigSchema } from "./config-schema.js";
import type { ConfigSource } from "./config-source.js";
import type { ConfigStore } from "./config-store.js";
import type {
  ConfigManager,
  ConfigManagerOptions,
} from "./config-manager.js";

import {
  createConfigManager,
  initializeConfigManager,
} from "./config-manager.js";

/**
 * Factory options for creating a configuration manager.
 */
export interface ConfigFactoryOptions
  extends ConfigManagerOptions {
  readonly name?: string;
}

/**
 * Creates a configuration manager without loading it.
 */
export function createConfiguration(
  options: ConfigFactoryOptions = {},
): ConfigManager {
  return createConfigManager(
    options,
  );
}

/**
 * Creates and initializes a configuration manager.
 */
export async function createInitializedConfiguration(
  options: ConfigFactoryOptions = {},
): Promise<ConfigManager> {
  return initializeConfigManager(
    options,
  );
}

/**
 * Creates a configuration manager from initial values.
 */
export function createConfigurationFromValues(
  values: Readonly<
    Record<string, ConfigValue>
  >,
  options: Omit<
    ConfigFactoryOptions,
    "initialValues"
  > = {},
): ConfigManager {
  return createConfigManager({
    ...options,
    initialValues: values,
  });
}

/**
 * Creates a configuration manager from sources.
 */
export function createConfigurationFromSources(
  sources: readonly ConfigSource[],
  options: Omit<
    ConfigFactoryOptions,
    "sources"
  > = {},
): ConfigManager {
  return createConfigManager({
    ...options,
    sources,
  });
}

/**
 * Creates a configuration manager from an existing store.
 */
export function createConfigurationFromStore(
  store: ConfigStore,
  options: Omit<
    ConfigFactoryOptions,
    "store"
  > = {},
): ConfigManager {
  return createConfigManager({
    ...options,
    store,
  });
}

/**
 * Creates a configuration manager and validates it against a schema.
 */
export async function createValidatedConfiguration<
  T extends ConfigValue = ConfigValue,
>(
  schema: {
    readonly properties:
      Readonly<
        Record<string, ConfigSchema>
      >;
    readonly additionalProperties?:
      boolean | ConfigSchema;
  },
  options: ConfigFactoryOptions = {},
): Promise<{
  readonly manager: ConfigManager;
  readonly config: T;
}> {
  const manager =
    await createInitializedConfiguration(
      options,
    );

  try {
    const config =
      manager.validate<T>(
        schema,
      );

    return {
      manager,
      config,
    };
  } catch (error) {
    await manager.dispose();

    throw error;
  }
}

/**
 * Factory object for dependency injection and application bootstrap.
 */
export const configFactory = Object.freeze({
  create:
    createConfiguration,

  initialize:
    createInitializedConfiguration,

  fromValues:
    createConfigurationFromValues,

  fromSources:
    createConfigurationFromSources,

  fromStore:
    createConfigurationFromStore,

  validated:
    createValidatedConfiguration,
});

export default configFactory;