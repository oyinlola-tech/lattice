import {
  Configuration,
} from "../core/configuration.js";

import type {
  ConfigurationKey,
} from "../core/configurationKey.key.js";

import type {
  ConfigurationSource,
} from "../core/configurationSource.source.js";

/**
 * Provides access to application configuration.
 *
 * The provider separates consumers of configuration from
 * the mechanism used to build and load that configuration.
 */
export interface ConfigurationProvider {
  /**
   * Returns the current configuration.
   */
  getConfiguration(): Configuration;

  /**
   * Retrieves a configuration value.
   */
  get<T = unknown>(
    path: string,
  ): T | undefined;

  /**
   * Retrieves a required configuration value.
   *
   * Throws when the requested value does not exist.
   */
  require<T = unknown>(
    path: string,
  ): T;

  /**
   * Retrieves a typed configuration value using a key.
   */
  getByKey<T>(
    key: ConfigurationKey<T>,
  ): T | undefined;

  /**
   * Retrieves a required typed configuration value.
   */
  requireByKey<T>(
    key: ConfigurationKey<T>,
  ): T;

  /**
   * Checks whether a configuration value exists.
   */
  has(
    path: string,
  ): boolean;

  /**
   * Reloads configuration from registered sources.
   */
  reload(): Promise<Configuration>;

  /**
   * Returns the configuration sources currently
   * registered with the provider.
   */
  getSources(): readonly ConfigurationSource[];
}

/**
 * Options used to create a ConfigurationProvider.
 */
export interface ConfigurationProviderOptions {
  /**
   * Initial configuration.
   */
  readonly configuration?: Configuration;

  /**
   * Sources used to build the configuration.
   */
  readonly sources?: readonly ConfigurationSource[];
}

/**
 * Default implementation of ConfigurationProvider.
 *
 * Responsible for coordinating configuration sources while
 * keeping the rest of the application independent from them.
 */
export class DefaultConfigurationProvider
  implements ConfigurationProvider
{
  private configuration: Configuration;

  private readonly sources: ConfigurationSource[];

  public constructor(
    options: ConfigurationProviderOptions = {},
  ) {
    this.configuration =
      options.configuration ??
      new Configuration();

    this.sources = [
      ...(options.sources ?? []),
    ];
  }

  /**
   * Returns the current configuration.
   */
  public getConfiguration(): Configuration {
    return this.configuration;
  }

  /**
   * Retrieves a configuration value.
   */
  public get<T = unknown>(
    path: string,
  ): T | undefined {
    return this.configuration.get<T>(
      path,
    );
  }

  /**
   * Retrieves a required configuration value.
   */
  public require<T = unknown>(
    path: string,
  ): T {
    return this.configuration.require<T>(
      path,
    );
  }

  /**
   * Retrieves a typed configuration value.
   */
  public getByKey<T>(
    key: ConfigurationKey<T>,
  ): T | undefined {
    return this.configuration.getByKey(
      key,
    );
  }

  /**
   * Retrieves a required typed configuration value.
   */
  public requireByKey<T>(
    key: ConfigurationKey<T>,
  ): T {
    return this.configuration.requireByKey(
      key,
    );
  }

  /**
   * Checks whether a configuration value exists.
   */
  public has(
    path: string,
  ): boolean {
    return this.configuration.has(
      path,
    );
  }

  /**
   * Reloads configuration from all registered sources.
   *
   * Sources are loaded according to priority. Higher priority
   * sources override values from lower priority sources.
   */
  public async reload(): Promise<Configuration> {
    const sources = [
      ...this.sources,
    ].sort(
      (a, b) =>
        a.priority - b.priority,
    );

    let configuration =
      new Configuration();

    for (const source of sources) {
      const entries =
        await source.load();

      for (const entry of entries) {
        configuration =
          configuration.with(
            entry.path,
            entry.value,
            source.type,
          );
      }
    }

    this.configuration =
      configuration;

    return configuration;
  }

  /**
   * Returns the registered configuration sources.
   */
  public getSources(): readonly ConfigurationSource[] {
    return [
      ...this.sources,
    ];
  }

  /**
   * Updates the provider with a new configuration.
   *
   * This is used by ConfigurationManager to push loaded
   * configuration into the provider.
   */
  public setConfiguration(
    configuration: Configuration,
  ): void {
    this.configuration = configuration;
  }

  /**
   * Registers an additional configuration source.
   *
   * The source is not loaded automatically.
   * Call reload() when the provider should rebuild its configuration.
   */
  public addSource(
    source: ConfigurationSource,
  ): void {
    this.sources.push(
      source,
    );
  }

  /**
   * Removes a configuration source by name.
   *
   * Returns true when a source was removed.
   */
  public removeSource(
    name: string,
  ): boolean {
    const index =
      this.sources.findIndex(
        (source) =>
          source.name === name,
      );

    if (index === -1) {
      return false;
    }

    this.sources.splice(
      index,
      1,
    );

    return true;
  }
}

/**
 * Creates the default configuration provider.
 */
export function createConfigurationProvider(
  options: ConfigurationProviderOptions = {},
): ConfigurationProvider {
  return new DefaultConfigurationProvider(
    options,
  );
}