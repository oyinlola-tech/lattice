import type {
  ConfigValue,
} from "./config-value.js";

import {
  cloneConfigValue,
  freezeConfigValue,
} from "./config-value.js";

import type {
  ConfigSchema,
} from "./config-schema.js";

import {
  ConfigValueType,
  validateConfigObject,
} from "./config-schema.js";

import type {
  ConfigSource,
} from "./config-source.js";

import {
  createConfigSource,
} from "./config-source.js";

import type {
  ConfigEntry,
} from "./config-entry.js";

import type {
  ConfigLoader,
  ConfigLoadResult,
} from "./config-loader.js";

import {
  createConfigLoader,
} from "./config-loader.js";

import type {
  ConfigStore,
} from "./config-store.js";

import {
  createConfigStore,
} from "./config-store.js";

import type {
  ConfigResolver,
  ConfigResolverOptions,
  ScopedConfigResolver,
} from "./config-resolver.js";

import {
  createConfigResolver,
} from "./config-resolver.js";

/**
 * Configuration manager lifecycle state.
 */
export enum ConfigManagerState {
  CREATED = "created",
  LOADING = "loading",
  READY = "ready",
  RELOADING = "reloading",
  FAILED = "failed",
  DISPOSED = "disposed",
}

/**
 * Configuration manager options.
 */
export interface ConfigManagerOptions
  extends ConfigResolverOptions {
  readonly sources?: readonly ConfigSource[];

  readonly initialValues?:
    Readonly<
      Record<string, ConfigValue>
    >;

  readonly store?: ConfigStore;

  readonly loader?: ConfigLoader;

  readonly freeze?: boolean;

  readonly autoLoad?: boolean;

  readonly context?: {
    readonly environment?: string;
    readonly namespace?: string;
    readonly signal?: AbortSignal;
  };
}

/**
 * Configuration manager status.
 */
export interface ConfigManagerStatus {
  readonly state: ConfigManagerState;
  readonly loaded: boolean;
  readonly loading: boolean;
  readonly size: number;
  readonly lastLoadedAt?: number;
  readonly lastError?: unknown;
}

/**
 * Listener for configuration manager state changes.
 */
export type ConfigManagerListener = (
  status: ConfigManagerStatus,
) => void;

/**
 * Central configuration lifecycle manager.
 *
 * ConfigManager coordinates the store, loader and resolver while
 * keeping their responsibilities separate.
 */
export class ConfigManager {
  private readonly store: ConfigStore;

  private readonly loader: ConfigLoader;

  private readonly resolver: ConfigResolver;

  private readonly listeners =
    new Set<ConfigManagerListener>();

  private state:
    ConfigManagerState =
    ConfigManagerState.CREATED;

  private lastLoadedAt?: number;

  private lastError?: unknown;

  private disposed = false;

  constructor(
    options: ConfigManagerOptions = {},
  ) {
    this.store =
      options.store ??
      createConfigStore({
        initialValues:
          options.initialValues,
        freeze:
          options.freeze ??
          true,
      });

    this.loader =
      options.loader ??
      createConfigLoader({
        sources:
          options.sources,
        context:
          options.context,
        store:
          this.store,
        freeze:
          options.freeze ??
          true,
      });

    this.resolver =
      createConfigResolver(
        this.store,
        {
          strict:
            options.strict ??
            true,
          allowUndefined:
            options.allowUndefined ??
            true,
          clone:
            options.clone ??
            false,
        },
      );
  }

  /**
   * Returns the current lifecycle state.
   */
  getState(): ConfigManagerState {
    return this.state;
  }

  /**
   * Returns whether the manager is ready.
   */
  get isReady(): boolean {
    return (
      this.state ===
      ConfigManagerState.READY
    );
  }

  /**
   * Returns whether configuration is currently loading.
   */
  get isLoading(): boolean {
    return (
      this.state ===
        ConfigManagerState.LOADING ||
      this.state ===
        ConfigManagerState.RELOADING
    );
  }

  /**
   * Returns the configuration store.
   */
  getStore(): ConfigStore {
    this.assertActive();

    return this.store;
  }

  /**
   * Returns the configuration loader.
   */
  getLoader(): ConfigLoader {
    this.assertActive();

    return this.loader;
  }

  /**
   * Returns the configuration resolver.
   */
  getResolver(): ConfigResolver {
    this.assertActive();

    return this.resolver;
  }

  /**
   * Returns a scoped resolver.
   */
  scoped(
    prefix: string,
  ): ScopedConfigResolver {
    this.assertActive();

    return this.resolver.scoped(
      prefix,
    );
  }

  /**
   * Loads configuration.
   */
  async load(): Promise<ConfigLoadResult> {
    this.assertActive();

    if (
      this.isLoading
    ) {
      throw new Error(
        "Configuration manager is already loading.",
      );
    }

    this.setState(
      ConfigManagerState.LOADING,
    );

    try {
      const result =
        await this.loader.load();

      this.lastLoadedAt =
        result.loadedAt;

      this.lastError =
        undefined;

      this.setState(
        ConfigManagerState.READY,
      );

      return result;
    } catch (error) {
      this.lastError =
        error;

      this.setState(
        ConfigManagerState.FAILED,
      );

      throw error;
    }
  }

  /**
   * Reloads configuration.
   */
  async reload(): Promise<ConfigLoadResult> {
    this.assertActive();

    if (
      this.isLoading
    ) {
      throw new Error(
        "Configuration manager is already loading.",
      );
    }

    this.setState(
      ConfigManagerState.RELOADING,
    );

    try {
      const result =
        await this.loader.reload();

      this.lastLoadedAt =
        result.loadedAt;

      this.lastError =
        undefined;

      this.setState(
        ConfigManagerState.READY,
      );

      return result;
    } catch (error) {
      this.lastError =
        error;

      this.setState(
        ConfigManagerState.FAILED,
      );

      throw error;
    }
  }

  /**
   * Loads a schema and validates the complete configuration.
   */
  validate<T extends ConfigValue>(
    schema: {
      readonly properties:
        Readonly<
          Record<string, ConfigSchema>
        >;
      readonly additionalProperties?:
        boolean | ConfigSchema;
    },
  ): T {
    this.assertActive();

    const result =
      validateConfigObject(
        this.store.toObject(),
        {
          type:
            ConfigValueType.OBJECT,
          properties:
            schema.properties,
          additionalProperties:
            schema.additionalProperties,
        },
      );

    if (
      !result.valid
    ) {
      throw new ConfigManagerValidationError(
        result.issues,
      );
    }

    return cloneConfigValue(
      result.value as T,
    );
  }

  /**
   * Gets a raw configuration value.
   */
  get<T extends ConfigValue = ConfigValue>(
    key: string,
  ): T | undefined {
    this.assertActive();

    return this.resolver.get<T>(
      key,
    );
  }

  /**
   * Gets a required configuration value.
   */
  required<T extends ConfigValue = ConfigValue>(
    key: string,
  ): T {
    this.assertActive();

    return this.resolver.required<T>(
      key,
    );
  }

  /**
   * Gets a configuration value with schema validation.
   */
  resolve<T extends ConfigValue>(
    key: string,
    schema: ConfigSchema<T>,
  ): T | undefined {
    this.assertActive();

    return this.resolver.resolve(
      key,
      schema,
    );
  }

  /**
   * Gets a string value.
   */
  string(
    key: string,
    fallback?: string,
  ): string | undefined {
    this.assertActive();

    return this.resolver.string(
      key,
      fallback,
    );
  }

  /**
   * Gets a number value.
   */
  number(
    key: string,
    fallback?: number,
  ): number | undefined {
    this.assertActive();

    return this.resolver.number(
      key,
      fallback,
    );
  }

  /**
   * Gets a boolean value.
   */
  boolean(
    key: string,
    fallback?: boolean,
  ): boolean | undefined {
    this.assertActive();

    return this.resolver.boolean(
      key,
      fallback,
    );
  }

  /**
   * Gets a bigint value.
   */
  bigint(
    key: string,
    fallback?: bigint,
  ): bigint | undefined {
    this.assertActive();

    return this.resolver.bigint(
      key,
      fallback,
    );
  }

  /**
   * Gets a Date value.
   */
  date(
    key: string,
    fallback?: Date,
  ): Date | undefined {
    this.assertActive();

    return this.resolver.date(
      key,
      fallback,
    );
  }

  /**
   * Gets an object value.
   */
  object<T extends ConfigValue = ConfigValue>(
    key: string,
    fallback?: T,
  ): T | undefined {
    this.assertActive();

    return this.resolver.object<T>(
      key,
      fallback,
    );
  }

  /**
   * Gets an array value.
   */
  array<T extends ConfigValue = ConfigValue>(
    key: string,
    fallback?: readonly T[],
  ): readonly T[] | undefined {
    this.assertActive();

    return this.resolver.array<T>(
      key,
      fallback,
    );
  }

  /**
   * Sets a runtime configuration value.
   */
  set<T extends ConfigValue>(
    key: string,
    value: T,
    options: {
      readonly source?: string;
      readonly priority?: number;
      readonly sensitive?: boolean;
    } = {},
  ): ConfigEntry<T> {
    this.assertActive();

    return this.store.set(
      key,
      value,
      {
        source:
          options.source ??
          "runtime",
        priority:
          options.priority ??
          Number.MAX_SAFE_INTEGER,
        sensitive:
          options.sensitive ??
          false,
      },
    );
  }

  /**
   * Removes a configuration value.
   */
  delete(
    key: string,
  ): boolean {
    this.assertActive();

    return this.store.delete(
      key,
    );
  }

  /**
   * Returns the complete configuration object.
   */
  toObject(): Readonly<
    Record<string, ConfigValue>
  > {
    this.assertActive();

    return this.store.toObject();
  }

  /**
   * Returns a manager status snapshot.
   */
  getStatus(): ConfigManagerStatus {
    return {
      state:
        this.state,
      loaded:
        this.isReady,
      loading:
        this.isLoading,
      size:
        this.store.size,
      lastLoadedAt:
        this.lastLoadedAt,
      lastError:
        this.lastError,
    };
  }

  /**
   * Subscribes to lifecycle state changes.
   */
  subscribe(
    listener: ConfigManagerListener,
  ): () => void {
    this.assertActive();

    if (
      typeof listener !==
        "function"
    ) {
      throw new TypeError(
        "Configuration manager listener must be a function.",
      );
    }

    this.listeners.add(
      listener,
    );

    return () => {
      this.listeners.delete(
        listener,
      );
    };
  }

  /**
   * Adds a configuration source.
   */
  addSource(
    source: ConfigSource,
  ): void {
    this.assertActive();

    this.loader.addSource(
      source,
    );
  }

  /**
   * Creates and adds a custom source.
   */
  addSourceLoader(
    name: string,
    loader: (
      context: {
        readonly environment?: string;
        readonly namespace?: string;
        readonly signal?: AbortSignal;
      },
    ) =>
      | {
          readonly values:
            Readonly<
              Record<string, ConfigValue>
            >;
          readonly source: string;
          readonly type: import("./config-source.js").ConfigSourceType;
        }
      | Promise<{
          readonly values:
            Readonly<
              Record<string, ConfigValue>
            >;
          readonly source: string;
          readonly type: import("./config-source.js").ConfigSourceType;
        }>,
  ): ConfigSource {
    this.assertActive();

    const source =
      createConfigSource(
        {
          name,
        },
        loader,
      );

    this.loader.addSource(
      source,
    );

    return source;
  }

  /**
   * Removes a source.
   */
  removeSource(
    name: string,
  ): boolean {
    this.assertActive();

    return this.loader.removeSource(
      name,
    );
  }

  /**
   * Marks the manager as disposed.
   */
  async dispose(): Promise<void> {
    if (
      this.disposed
    ) {
      return;
    }

    this.disposed =
      true;

    this.listeners.clear();

    await this.loader.dispose();

    this.store.dispose();

    this.state =
      ConfigManagerState.DISPOSED;
  }

  private setState(
    state: ConfigManagerState,
  ): void {
    this.state =
      state;

    const status =
      this.getStatus();

    for (
      const listener of
      this.listeners
    ) {
      try {
        listener(
          status,
        );
      } catch {
        // State listeners must not interrupt configuration lifecycle.
      }
    }
  }

  private assertActive(): void {
    if (
      this.disposed ||
      this.state ===
        ConfigManagerState.DISPOSED
    ) {
      throw new Error(
        "ConfigManager has been disposed.",
      );
    }
  }
}

/**
 * Creates a configuration manager.
 */
export function createConfigManager(
  options: ConfigManagerOptions = {},
): ConfigManager {
  return new ConfigManager(
    options,
  );
}

/**
 * Creates a manager and loads configuration immediately.
 */
export async function initializeConfigManager(
  options: ConfigManagerOptions = {},
): Promise<ConfigManager> {
  const manager =
    createConfigManager(
      options,
    );

  try {
    await manager.load();

    return manager;
  } catch (error) {
    await manager.dispose();

    throw error;
  }
}

/**
 * Error thrown when complete configuration validation fails.
 */
export class ConfigManagerValidationError
  extends Error {
  readonly issues:
    readonly unknown[];

  constructor(
    issues: readonly unknown[],
  ) {
    super(
      `Configuration validation failed with ${issues.length} issue${
        issues.length === 1
          ? ""
          : "s"
      }.`,
    );

    this.name =
      "ConfigManagerValidationError";

    this.issues =
      Object.freeze([
        ...issues,
      ]);

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}