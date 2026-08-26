import {
  Configuration,
} from "./configuration.js";

import {
  ConfigurationLoader,
} from "./configuration-loader.js";

import type {
  ConfigurationLoaderOptions,
  ConfigurationLoadResult,
} from "./configuration-loader.js";

import type {
  ConfigurationProvider,
} from "./configuration-provider.js";

import {
  DefaultConfigurationProvider,
} from "./configuration-provider.js";

import {
  ConfigurationRegistry,
} from "./configuration-registry.js";

import {
  ConfigurationSchemaRegistry,
} from "./configuration-schema.js";

import {
  validateConfiguration,
} from "./configuration-validation.js";

import type {
  ConfigurationValidationOptions,
  ConfigurationValidationReport,
} from "./configuration-validation.js";

import {
  ConfigurationValidationError,
} from "./configuration-validation.js";

import {
  ConfigurationRedactor,
} from "./configuration-redactor.js";

import type {
  ConfigurationRedactorOptions,
  RedactedConfiguration,
} from "./configuration-redactor.js";

/**
 * Lifecycle state of the configuration manager.
 */
export enum ConfigurationManagerState {
  /**
   * Manager has been created but configuration has not
   * been initialized.
   */
  CREATED = "created",

  /**
   * Configuration is currently being loaded.
   */
  LOADING = "loading",

  /**
   * Configuration has been loaded but not validated.
   */
  LOADED = "loaded",

  /**
   * Configuration has passed validation.
   */
  READY = "ready",

  /**
   * Configuration initialization failed.
   */
  FAILED = "failed",
}

/**
 * Options used to create a ConfigurationManager.
 */
export interface ConfigurationManagerOptions {
  /**
   * Optional configuration loader.
   *
   * If omitted, one is created automatically.
   */
  readonly loader?: ConfigurationLoader;

  /**
   * Optional configuration provider.
   *
   * If omitted, one is created automatically.
   */
  readonly provider?: ConfigurationProvider;

  /**
   * Optional configuration registry.
   */
  readonly registry?: ConfigurationRegistry;

  /**
   * Optional schema registry.
   */
  readonly schemas?: ConfigurationSchemaRegistry;

  /**
   * Optional redactor.
   */
  readonly redactor?: ConfigurationRedactor;

  /**
   * Configuration loader options.
   *
   * Used only when a loader is not supplied.
   */
  readonly loaderOptions?: ConfigurationLoaderOptions;

  /**
   * Configuration validation options.
   */
  readonly validationOptions?: ConfigurationValidationOptions;

  /**
   * Configuration redaction options.
   *
   * Used only when a redactor is not supplied.
   */
  readonly redactorOptions?: ConfigurationRedactorOptions;
}

/**
 * Complete configuration initialization result.
 */
export interface ConfigurationManagerResult {
  /**
   * Final configuration.
   */
  readonly configuration: Configuration;

  /**
   * Load information.
   */
  readonly load: ConfigurationLoadResult;

  /**
   * Validation information.
   */
  readonly validation: ConfigurationValidationReport;
}

/**
 * Coordinates the complete configuration lifecycle.
 *
 * Responsibilities:
 *
 * Registry
 *   ↓
 * Loader
 *   ↓
 * Configuration
 *   ↓
 * Schema validation
 *   ↓
 * Provider
 *   ↓
 * Redacted diagnostics
 */
export class ConfigurationManager {
  private readonly loader: ConfigurationLoader;

  private readonly provider: ConfigurationProvider;

  private readonly registry: ConfigurationRegistry;

  private readonly schemas: ConfigurationSchemaRegistry;

  private readonly redactor: ConfigurationRedactor;

  private readonly validationOptions:
    ConfigurationValidationOptions;

  private configuration:
    Configuration | undefined;

  private loadResult:
    ConfigurationLoadResult | undefined;

  private validationReport:
    ConfigurationValidationReport | undefined;

  private stateValue:
    ConfigurationManagerState =
      ConfigurationManagerState.CREATED;

  public constructor(
    options: ConfigurationManagerOptions = {},
  ) {
    this.loader =
      options.loader ??
      new ConfigurationLoader(
        options.loaderOptions,
      );

    this.provider =
      options.provider ??
      new DefaultConfigurationProvider();

    this.registry =
      options.registry ??
      new ConfigurationRegistry();

    this.schemas =
      options.schemas ??
      new ConfigurationSchemaRegistry();

    this.redactor =
      options.redactor ??
      new ConfigurationRedactor(
        options.redactorOptions,
      );

    this.validationOptions =
      options.validationOptions ?? {};
  }

  /**
   * Initializes the configuration system.
   *
   * Configuration is loaded, validated, and then exposed
   * through the provider.
   */
  public async initialize(): Promise<ConfigurationManagerResult> {
    if (
      this.stateValue ===
      ConfigurationManagerState.LOADING
    ) {
      throw new Error(
        "Configuration initialization is already in progress.",
      );
    }

    this.stateValue =
      ConfigurationManagerState.LOADING;

    try {
      const loadResult =
        await this.loader.load();

      this.loadResult =
        loadResult;

      this.configuration =
        loadResult.configuration;

      this.stateValue =
        ConfigurationManagerState.LOADED;

      const validation =
        await validateConfiguration(
          this.configuration,
          this.schemas,
          this.validationOptions,
        );

      this.validationReport =
        validation;

      if (!validation.valid) {
        this.stateValue =
          ConfigurationManagerState.FAILED;

        throw new ConfigurationValidationError(
          validation.issues,
          validation.schemaCount,
          validation.invalidSchemaCount,
        );
      }

      this.providerConfiguration(
        this.configuration,
      );

      this.stateValue =
        ConfigurationManagerState.READY;

      return {
        configuration:
          this.configuration,

        load:
          loadResult,

        validation,
      };
    } catch (error) {
      this.stateValue =
        ConfigurationManagerState.FAILED;

      throw error;
    }
  }

  /**
   * Reloads configuration.
   *
   * The new configuration is validated before replacing
   * the currently active configuration.
   */
  public async reload(): Promise<ConfigurationManagerResult> {
    if (
      this.stateValue !==
      ConfigurationManagerState.READY
    ) {
      return this.initialize();
    }

    const previousConfiguration =
      this.configuration;

    const previousLoadResult =
      this.loadResult;

    const previousValidation =
      this.validationReport;

    this.stateValue =
      ConfigurationManagerState.LOADING;

    try {
      const loadResult =
        await this.loader.load();

      const configuration =
        loadResult.configuration;

      const validation =
        await validateConfiguration(
          configuration,
          this.schemas,
          this.validationOptions,
        );

      if (!validation.valid) {
        this.configuration =
          previousConfiguration;

        this.loadResult =
          previousLoadResult;

        this.validationReport =
          previousValidation;

        this.stateValue =
          ConfigurationManagerState.READY;

        throw new ConfigurationValidationError(
          validation.issues,
          validation.schemaCount,
          validation.invalidSchemaCount,
        );
      }

      this.configuration =
        configuration;

      this.loadResult =
        loadResult;

      this.validationReport =
        validation;

      this.providerConfiguration(
        configuration,
      );

      this.stateValue =
        ConfigurationManagerState.READY;

      return {
        configuration,
        load: loadResult,
        validation,
      };
    } catch (error) {
      if (
        this.configuration !==
        previousConfiguration
      ) {
        this.configuration =
          previousConfiguration;
      }

      this.stateValue =
        previousConfiguration
          ? ConfigurationManagerState.READY
          : ConfigurationManagerState.FAILED;

      throw error;
    }
  }

  /**
   * Returns the active configuration.
   *
   * Throws if configuration has not been successfully initialized.
   */
  public getConfiguration(): Configuration {
    this.ensureReady();

    return this.configuration as Configuration;
  }

  /**
   * Returns the configuration provider.
   */
  public getProvider(): ConfigurationProvider {
    return this.provider;
  }

  /**
   * Returns the configuration registry.
   */
  public getRegistry(): ConfigurationRegistry {
    return this.registry;
  }

  /**
   * Returns the schema registry.
   */
  public getSchemaRegistry(): ConfigurationSchemaRegistry {
    return this.schemas;
  }

  /**
   * Returns the configuration loader.
   */
  public getLoader(): ConfigurationLoader {
    return this.loader;
  }

  /**
   * Returns the configuration redactor.
   */
  public getRedactor(): ConfigurationRedactor {
    return this.redactor;
  }

  /**
   * Returns the current lifecycle state.
   */
  public getState(): ConfigurationManagerState {
    return this.stateValue;
  }

  /**
   * Checks whether configuration is ready.
   */
  public isReady(): boolean {
    return (
      this.stateValue ===
      ConfigurationManagerState.READY
    );
  }

  /**
   * Returns the latest validation report.
   */
  public getValidationReport():
    | ConfigurationValidationReport
    | undefined {
    return this.validationReport;
  }

  /**
   * Returns the latest load result.
   */
  public getLoadResult():
    | ConfigurationLoadResult
    | undefined {
    return this.loadResult;
  }

  /**
   * Returns a redacted representation of the
   * active configuration.
   */
  public getRedactedConfiguration():
    | RedactedConfiguration
    | undefined {
    if (!this.configuration) {
      return undefined;
    }

    return this.redactor.redact(
      this.configuration,
    );
  }

  /**
   * Gets a configuration value.
   */
  public get<T = unknown>(
    path: string,
  ): T | undefined {
    return this.getProvider().get<T>(
      path,
    );
  }

  /**
   * Gets a required configuration value.
   */
  public require<T = unknown>(
    path: string,
  ): T {
    return this.getProvider().require<T>(
      path,
    );
  }

  /**
   * Updates the provider with a new configuration.
   */
  private providerConfiguration(
    configuration: Configuration,
  ): void {
    if (
      this.provider instanceof
      DefaultConfigurationProvider
    ) {
      this.provider.setConfiguration(
        configuration,
      );

      return;
    }

    /**
     * Custom providers are expected to expose their
     * own configuration update mechanism.
     *
     * If the provider is not the default implementation,
     * configuration loading remains available through
     * the manager, but the provider itself must be
     * configured by its implementation.
     */
  }

  /**
   * Ensures that configuration has been initialized
   * successfully.
   */
  private ensureReady(): void {
    if (
      this.stateValue !==
      ConfigurationManagerState.READY
    ) {
      throw new Error(
        `Configuration is not ready. Current state: ${this.stateValue}.`,
      );
    }
  }
}

/**
 * Creates a ConfigurationManager.
 */
export function createConfigurationManager(
  options: ConfigurationManagerOptions = {},
): ConfigurationManager {
  return new ConfigurationManager(
    options,
  );
}