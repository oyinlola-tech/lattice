import { Configuration } from "./core/configuration.js";
import { ConfigurationLoader } from "./loader/configurationLoader.loader.js";
import type {
  ConfigurationLoaderOptions,
  ConfigurationLoadResult,
} from "./loader/configurationLoader.loader.js";
import type { ConfigurationProvider } from "./registry/configurationProvider.provider.js";
import { DefaultConfigurationProvider } from "./registry/configurationProvider.provider.js";
import { ConfigurationRegistry } from "./registry/configurationRegistry.registry.js";
import { ConfigurationSchemaRegistry } from "./schema/configurationSchema.schema.js";
import { validateConfiguration } from "./schema/configurationValidation.validator.js";
import type {
  ConfigurationValidationOptions,
  ConfigurationValidationReport,
} from "./schema/configurationValidation.validator.js";
import { ConfigurationValidationError } from "./schema/configurationValidation.validator.js";
import { ConfigurationRedactor } from "./error/configurationRedactor.redactor.js";
import type {
  ConfigurationRedactorOptions,
  RedactedConfiguration,
} from "./error/configurationRedactor.redactor.js";

/** Lifecycle state of the configuration manager. */
export enum ConfigurationManagerState {
  CREATED = "created",
  LOADING = "loading",
  LOADED = "loaded",
  READY = "ready",
  FAILED = "failed",
}

/** Options used to create a ConfigurationManager. */
export interface ConfigurationManagerOptions {
  readonly loader?: ConfigurationLoader;
  readonly provider?: ConfigurationProvider;
  readonly registry?: ConfigurationRegistry;
  readonly schemas?: ConfigurationSchemaRegistry;
  readonly redactor?: ConfigurationRedactor;
  readonly loaderOptions?: ConfigurationLoaderOptions;
  readonly validationOptions?: ConfigurationValidationOptions;
  readonly redactorOptions?: ConfigurationRedactorOptions;
}

/** Complete configuration initialization result. */
export interface ConfigurationManagerResult {
  readonly configuration: Configuration;
  readonly load: ConfigurationLoadResult;
  readonly validation: ConfigurationValidationReport;
}

/** Coordinates the complete configuration lifecycle. */
export class ConfigurationManager {
  private readonly loader: ConfigurationLoader;
  private readonly provider: ConfigurationProvider;
  private readonly registry: ConfigurationRegistry;
  private readonly schemas: ConfigurationSchemaRegistry;
  private readonly redactor: ConfigurationRedactor;
  private readonly validationOptions: ConfigurationValidationOptions;
  private configuration: Configuration | undefined;
  private loadResult: ConfigurationLoadResult | undefined;
  private validationReport: ConfigurationValidationReport | undefined;
  private stateValue: ConfigurationManagerState =
    ConfigurationManagerState.CREATED;

  public constructor(options: ConfigurationManagerOptions = {}) {
    this.loader =
      options.loader ?? new ConfigurationLoader(options.loaderOptions);
    this.provider = options.provider ?? new DefaultConfigurationProvider();
    this.registry = options.registry ?? new ConfigurationRegistry();
    this.schemas = options.schemas ?? new ConfigurationSchemaRegistry();
    this.redactor =
      options.redactor ?? new ConfigurationRedactor(options.redactorOptions);
    this.validationOptions = options.validationOptions ?? {};
  }

  public async initialize(): Promise<ConfigurationManagerResult> {
    if (this.stateValue === ConfigurationManagerState.LOADING)
      throw new Error("Configuration initialization is already in progress.");
    this.stateValue = ConfigurationManagerState.LOADING;

    try {
      const loadResult = await this.loader.load();
      this.loadResult = loadResult;
      this.configuration = loadResult.configuration;
      this.stateValue = ConfigurationManagerState.LOADED;

      const validation = await validateConfiguration(
        this.configuration,
        this.schemas,
        this.validationOptions,
      );
      this.validationReport = validation;

      if (!validation.valid) {
        this.stateValue = ConfigurationManagerState.FAILED;
        throw new ConfigurationValidationError(
          validation.issues,
          validation.schemaCount,
          validation.invalidSchemaCount,
        );
      }

      this.providerConfiguration(this.configuration);
      this.stateValue = ConfigurationManagerState.READY;
      return {
        configuration: this.configuration,
        load: loadResult,
        validation,
      };
    } catch (error) {
      this.stateValue = ConfigurationManagerState.FAILED;
      throw error;
    }
  }

  public async reload(): Promise<ConfigurationManagerResult> {
    if (this.stateValue !== ConfigurationManagerState.READY)
      return this.initialize();

    const previousConfiguration = this.configuration;
    const previousLoadResult = this.loadResult;
    const previousValidation = this.validationReport;
    this.stateValue = ConfigurationManagerState.LOADING;

    try {
      const loadResult = await this.loader.load();
      const configuration = loadResult.configuration;
      const validation = await validateConfiguration(
        configuration,
        this.schemas,
        this.validationOptions,
      );

      if (!validation.valid) {
        this.configuration = previousConfiguration;
        this.loadResult = previousLoadResult;
        this.validationReport = previousValidation;
        this.stateValue = ConfigurationManagerState.READY;
        throw new ConfigurationValidationError(
          validation.issues,
          validation.schemaCount,
          validation.invalidSchemaCount,
        );
      }

      this.configuration = configuration;
      this.loadResult = loadResult;
      this.validationReport = validation;
      this.providerConfiguration(configuration);
      this.stateValue = ConfigurationManagerState.READY;
      return { configuration, load: loadResult, validation };
    } catch (error) {
      if (this.configuration !== previousConfiguration)
        this.configuration = previousConfiguration;
      this.stateValue = previousConfiguration
        ? ConfigurationManagerState.READY
        : ConfigurationManagerState.FAILED;
      throw error;
    }
  }

  public getConfiguration(): Configuration {
    this.ensureReady();
    return this.configuration as Configuration;
  }
  public getProvider(): ConfigurationProvider {
    return this.provider;
  }
  public getRegistry(): ConfigurationRegistry {
    return this.registry;
  }
  public getSchemaRegistry(): ConfigurationSchemaRegistry {
    return this.schemas;
  }
  public getLoader(): ConfigurationLoader {
    return this.loader;
  }
  public getRedactor(): ConfigurationRedactor {
    return this.redactor;
  }
  public getState(): ConfigurationManagerState {
    return this.stateValue;
  }
  public isReady(): boolean {
    return this.stateValue === ConfigurationManagerState.READY;
  }
  public getValidationReport(): ConfigurationValidationReport | undefined {
    return this.validationReport;
  }
  public getLoadResult(): ConfigurationLoadResult | undefined {
    return this.loadResult;
  }
  public getRedactedConfiguration(): RedactedConfiguration | undefined {
    return this.configuration
      ? this.redactor.redact(this.configuration)
      : undefined;
  }
  public get<T = unknown>(path: string): T | undefined {
    return this.getProvider().get<T>(path);
  }
  public require<T = unknown>(path: string): T {
    return this.getProvider().require<T>(path);
  }

  private providerConfiguration(configuration: Configuration): void {
    if (this.provider instanceof DefaultConfigurationProvider)
      this.provider.setConfiguration(configuration);
  }

  private ensureReady(): void {
    if (this.stateValue !== ConfigurationManagerState.READY)
      throw new Error(
        `Configuration is not ready. Current state: ${this.stateValue}.`,
      );
  }
}

/** Creates a ConfigurationManager. */
export function createConfigurationManager(
  options: ConfigurationManagerOptions = {},
): ConfigurationManager {
  return new ConfigurationManager(options);
}
