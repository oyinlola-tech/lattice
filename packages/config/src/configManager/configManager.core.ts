import type { ConfigValue } from "../configValue/configValue.core.js";

import { cloneConfigValue } from "../configValue/configValue.core.js";

import type { ConfigSchema } from "../configSchema/configSchema.core.js";

import {
  ConfigValueType,
  validateConfigObject,
} from "../configSchema/configSchema.core.js";

import type { ConfigSource } from "../configSource/configSource.core.js";

import { createConfigSource } from "../configSource/configSource.core.js";

import type { ConfigEntry } from "../configEntry/configEntry.type.js";

import type {
  ConfigLoader,
  ConfigLoadResult,
} from "../configLoader/configLoader.core.js";

import { createConfigLoader } from "../configLoader/configLoader.core.js";

import type { ConfigStore } from "../configStore/configStore.core.js";

import { createConfigStore } from "../configStore/configStore.factory.js";

import type { ConfigResolver } from "../configResolver/core/configResolver.core.js";

import type { ScopedConfigResolver } from "../configResolver/accessors/configResolver.scoped.js";

import { createConfigResolver } from "../configResolver/core/configResolver.factory.js";

import type {
  ConfigManagerOptions,
  ConfigManagerStatus,
  ConfigManagerListener,
} from "./configManager.type.js";

import { ConfigManagerState } from "./configManager.type.js";

import { ConfigManagerValidationError } from "./configManager.error.js";

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

  private readonly listeners = new Set<ConfigManagerListener>();

  private state: ConfigManagerState = ConfigManagerState.CREATED;

  private lastLoadedAt?: number;

  private lastError?: unknown;

  private disposed = false;

  constructor(options: ConfigManagerOptions = {}) {
    this.store =
      options.store ??
      createConfigStore({
        initialValues: options.initialValues,
        freeze: options.freeze ?? true,
      });

    this.loader =
      options.loader ??
      createConfigLoader({
        sources: options.sources,
        context: options.context,
        store: this.store,
        freeze: options.freeze ?? true,
      });

    this.resolver = createConfigResolver(this.store, {
      strict: options.strict ?? true,
      allowUndefined: options.allowUndefined ?? true,
      clone: options.clone ?? false,
    });
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
    return this.state === ConfigManagerState.READY;
  }

  /**
   * Returns whether configuration is currently loading.
   */
  get isLoading(): boolean {
    return (
      this.state === ConfigManagerState.LOADING ||
      this.state === ConfigManagerState.RELOADING
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
  scoped(prefix: string): ScopedConfigResolver {
    this.assertActive();

    return this.resolver.scoped(prefix);
  }

  /**
   * Loads configuration.
   */
  async load(): Promise<ConfigLoadResult> {
    this.assertActive();

    if (this.isLoading) {
      throw new Error("Configuration manager is already loading.");
    }

    this.setState(ConfigManagerState.LOADING);

    try {
      const result = await this.loader.load();

      this.lastLoadedAt = result.loadedAt;

      this.lastError = undefined;

      this.setState(ConfigManagerState.READY);

      return result;
    } catch (error) {
      this.lastError = error;

      this.setState(ConfigManagerState.FAILED);

      throw error;
    }
  }

  /**
   * Reloads configuration.
   */
  async reload(): Promise<ConfigLoadResult> {
    this.assertActive();

    if (this.isLoading) {
      throw new Error("Configuration manager is already loading.");
    }

    this.setState(ConfigManagerState.RELOADING);

    try {
      const result = await this.loader.reload();

      this.lastLoadedAt = result.loadedAt;

      this.lastError = undefined;

      this.setState(ConfigManagerState.READY);

      return result;
    } catch (error) {
      this.lastError = error;

      this.setState(ConfigManagerState.FAILED);

      throw error;
    }
  }

  /**
   * Loads a schema and validates the complete configuration.
   */
  validate<T extends ConfigValue>(schema: {
    readonly properties: Readonly<Record<string, ConfigSchema>>;
    readonly additionalProperties?: boolean | ConfigSchema;
  }): T {
    this.assertActive();

    const result = validateConfigObject(this.store.toObject(), {
      type: ConfigValueType.OBJECT,
      properties: schema.properties,
      additionalProperties: schema.additionalProperties,
    });

    if (!result.valid) {
      throw new ConfigManagerValidationError(result.issues);
    }

    return cloneConfigValue(result.value as T);
  }

  /**
   * Gets a raw configuration value.
   */
  get<T extends ConfigValue = ConfigValue>(key: string): T | undefined {
    this.assertActive();

    return this.resolver.get<T>(key);
  }

  /**
   * Gets a required configuration value.
   */
  required<T extends ConfigValue = ConfigValue>(key: string): T {
    this.assertActive();

    return this.resolver.required<T>(key);
  }

  /**
   * Gets a configuration value with schema validation.
   */
  resolve<T extends ConfigValue>(
    key: string,
    schema: ConfigSchema<T>,
  ): T | undefined {
    this.assertActive();

    return this.resolver.resolve(key, schema);
  }

  /**
   * Gets a string value.
   */
  string(key: string, fallback?: string): string | undefined {
    this.assertActive();

    return this.resolver.string(key, fallback);
  }

  /**
   * Gets a number value.
   */
  number(key: string, fallback?: number): number | undefined {
    this.assertActive();

    return this.resolver.number(key, fallback);
  }

  /**
   * Gets a boolean value.
   */
  boolean(key: string, fallback?: boolean): boolean | undefined {
    this.assertActive();

    return this.resolver.boolean(key, fallback);
  }

  /**
   * Gets a bigint value.
   */
  bigint(key: string, fallback?: bigint): bigint | undefined {
    this.assertActive();

    return this.resolver.bigint(key, fallback);
  }

  /**
   * Gets a Date value.
   */
  date(key: string, fallback?: Date): Date | undefined {
    this.assertActive();

    return this.resolver.date(key, fallback);
  }

  /**
   * Gets an object value.
   */
  object<T extends ConfigValue = ConfigValue>(
    key: string,
    fallback?: T,
  ): T | undefined {
    this.assertActive();

    return this.resolver.object<T>(key, fallback);
  }

  /**
   * Gets an array value.
   */
  array<T extends ConfigValue = ConfigValue>(
    key: string,
    fallback?: readonly T[],
  ): readonly T[] | undefined {
    this.assertActive();

    return this.resolver.array<T>(key, fallback);
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

    return this.store.set(key, value, {
      source: options.source ?? "runtime",
      priority: options.priority ?? Number.MAX_SAFE_INTEGER,
      sensitive: options.sensitive ?? false,
    });
  }

  /**
   * Removes a configuration value.
   */
  delete(key: string): boolean {
    this.assertActive();

    return this.store.delete(key);
  }

  /**
   * Returns the complete configuration object.
   */
  toObject(): Readonly<Record<string, ConfigValue>> {
    this.assertActive();

    return this.store.toObject();
  }

  /**
   * Returns a manager status snapshot.
   */
  getStatus(): ConfigManagerStatus {
    return {
      state: this.state,
      loaded: this.isReady,
      loading: this.isLoading,
      size: this.store.size,
      lastLoadedAt: this.lastLoadedAt,
      lastError: this.lastError,
    };
  }

  /**
   * Subscribes to lifecycle state changes.
   */
  subscribe(listener: ConfigManagerListener): () => void {
    this.assertActive();

    if (typeof listener !== "function") {
      throw new TypeError("Configuration manager listener must be a function.");
    }

    this.listeners.add(listener);

    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Adds a configuration source.
   */
  addSource(source: ConfigSource): void {
    this.assertActive();

    this.loader.addSource(source);
  }

  /**
   * Creates and adds a custom source.
   */
  addSourceLoader(
    name: string,
    loader: (context: {
      readonly environment?: string;
      readonly namespace?: string;
      readonly signal?: AbortSignal;
    }) =>
      | {
          readonly values: Readonly<Record<string, ConfigValue>>;
          readonly source: string;
          readonly type: import("../configSource/configSource.core.js").ConfigSourceType;
        }
      | Promise<{
          readonly values: Readonly<Record<string, ConfigValue>>;
          readonly source: string;
          readonly type: import("../configSource/configSource.core.js").ConfigSourceType;
        }>,
  ): ConfigSource {
    this.assertActive();

    const source = createConfigSource(
      {
        name,
      },
      loader,
    );

    this.loader.addSource(source);

    return source;
  }

  /**
   * Removes a source.
   */
  removeSource(name: string): boolean {
    this.assertActive();

    return this.loader.removeSource(name);
  }

  /**
   * Marks the manager as disposed.
   */
  async dispose(): Promise<void> {
    if (this.disposed) {
      return;
    }

    this.disposed = true;

    this.listeners.clear();

    await this.loader.dispose();

    this.store.dispose();

    this.state = ConfigManagerState.DISPOSED;
  }

  private setState(state: ConfigManagerState): void {
    this.state = state;

    const status = this.getStatus();

    for (const listener of this.listeners) {
      try {
        listener(status);
      } catch {
        // State listeners must not interrupt configuration lifecycle.
      }
    }
  }

  private assertActive(): void {
    if (this.disposed || this.state === ConfigManagerState.DISPOSED) {
      throw new Error("ConfigManager has been disposed.");
    }
  }
}
