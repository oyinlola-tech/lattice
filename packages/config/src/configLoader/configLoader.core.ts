import type {
  ConfigValue,
} from "../configValue/configValue.core.js";

import {
  cloneConfigValue,
} from "../configValue/configValue.core.js";

import type {
  ConfigEntry,
} from "../configEntry/configEntry.type.js";

import {
  createConfigEntry,
} from "../configEntry/configEntry.type.js";

import type {
  ConfigSource,
  ConfigSourceContext,
  ConfigSourceResult,
} from "../configSource/configSource.core.js";

import {
  loadConfigSources,
  sortConfigSources,
} from "../configSource/configSource.core.js";

import type {
  ConfigStore,
} from "../configStore/configStore.core.js";

import {
  createConfigStore,
} from "../configStore/configStore.factory.js";

/**
 * Options controlling configuration loading.
 */
export interface ConfigLoaderOptions {
  readonly sources?: readonly ConfigSource[];

  readonly context?: ConfigSourceContext;

  readonly store?: ConfigStore;

  readonly freeze?: boolean;

  readonly clearStore?: boolean;

  readonly onSourceLoaded?: (
    source: ConfigSource,
    result: ConfigSourceResult,
  ) => void | Promise<void>;

  readonly onSourceError?: (
    source: ConfigSource,
    error: unknown,
  ) => void | Promise<void>;
}

/**
 * Result returned after configuration loading.
 */
export interface ConfigLoadResult {
  readonly store: ConfigStore;

  readonly entries: readonly ConfigEntry[];

  readonly sources: readonly ConfigSourceResult[];

  readonly loadedAt: number;
}

/**
 * Configuration loader.
 *
 * Sources are loaded in priority order and their values are resolved
 * into a single ConfigStore. Higher-priority sources win.
 */
export class ConfigLoader {
  private readonly sources: ConfigSource[];

  private readonly context: ConfigSourceContext;

  private readonly store: ConfigStore;

  private readonly onSourceLoaded?:
    ConfigLoaderOptions["onSourceLoaded"];

  private readonly onSourceError?:
    ConfigLoaderOptions["onSourceError"];

  private readonly clearStore: boolean;

  private loading = false;

  private loaded = false;

  private disposed = false;

  private lastResult?: ConfigLoadResult;

  constructor(
    options: ConfigLoaderOptions = {},
  ) {
    this.sources = [
      ...(options.sources ?? []),
    ];

    this.context =
      options.context ?? {};

    this.store =
      options.store ??
      createConfigStore({
        freeze:
          options.freeze ??
          true,
      });

    this.onSourceLoaded =
      options.onSourceLoaded;

    this.onSourceError =
      options.onSourceError;

    this.clearStore =
      options.clearStore ??
      true;
  }

  /**
   * Returns the underlying configuration store.
   */
  getStore(): ConfigStore {
    this.assertActive();

    return this.store;
  }

  /**
   * Returns the configured sources.
   */
  getSources(): readonly ConfigSource[] {
    this.assertActive();

    return [
      ...this.sources,
    ];
  }

  /**
   * Returns whether configuration has been loaded.
   */
  get isLoaded(): boolean {
    return (
      this.loaded &&
      !this.disposed
    );
  }

  /**
   * Returns whether configuration is currently loading.
   */
  get isLoading(): boolean {
    return this.loading;
  }

  /**
   * Returns the previous load result.
   */
  get lastLoadResult():
    | ConfigLoadResult
    | undefined {
    return this.lastResult;
  }

  /**
   * Loads all configured sources.
   */
  async load(): Promise<ConfigLoadResult> {
    this.assertActive();

    if (
      this.loading
    ) {
      throw new Error(
        "Configuration is already being loaded.",
      );
    }

    this.loading = true;

    try {
      if (
        this.clearStore
      ) {
        this.store.clear();
      }

      const sortedSources =
        sortConfigSources(
          this.sources,
        );

      const results:
        ConfigSourceResult[] =
        [];

      for (
        const source of sortedSources
      ) {
        try {
          const result =
            await loadSingleSource(
              source,
              this.context,
            );

          if (
            !result
          ) {
            continue;
          }

          results.push(
            result,
          );

          this.applySource(
            source,
            result,
          );

          if (
            this.onSourceLoaded
          ) {
            await this.onSourceLoaded(
              source,
              result,
            );
          }
        } catch (error) {
          if (
            this.onSourceError
          ) {
            await this.onSourceError(
              source,
              error,
            );
          }

          if (
            !source.optional
          ) {
            throw error;
          }
        }
      }

      const result:
        ConfigLoadResult = {
        store:
          this.store,
        entries:
          this.store.getEntries(),
        sources:
          results,
        loadedAt:
          Date.now(),
      };

      this.lastResult =
        result;

      this.loaded = true;

      return result;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Reloads configuration.
   *
   * The current store is replaced with freshly loaded values.
   */
  async reload(): Promise<ConfigLoadResult> {
    this.assertActive();

    this.loaded = false;

    return this.load();
  }

  /**
   * Loads only selected sources.
   */
  async loadSources(
    sources: readonly ConfigSource[],
  ): Promise<ConfigLoadResult> {
    this.assertActive();

    const temporaryLoader =
      new ConfigLoader({
        sources,
        context:
          this.context,
        store:
          this.store,
        clearStore:
          this.clearStore,
      });

    const result =
      await temporaryLoader.load();

    temporaryLoader.detach();

    return result;
  }

  /**
   * Adds a source to the loader.
   */
  addSource(
    source: ConfigSource,
  ): void {
    this.assertActive();

    if (
      this.sources.some(
        (existing) =>
          existing.name ===
          source.name,
      )
    ) {
      throw new Error(
        `Configuration source "${source.name}" is already registered.`,
      );
    }

    this.sources.push(
      source,
    );
  }

  /**
   * Removes a source by name.
   */
  removeSource(
    name: string,
  ): boolean {
    this.assertActive();

    const index =
      this.sources.findIndex(
        (source) =>
          source.name === name,
      );

    if (
      index === -1
    ) {
      return false;
    }

    this.sources.splice(
      index,
      1,
    );

    return true;
  }

  /**
   * Finds a source by name.
   */
  getSource(
    name: string,
  ): ConfigSource | undefined {
    this.assertActive();

    return this.sources.find(
      (source) =>
        source.name === name,
    );
  }

  /**
   * Disposes the loader and its source resources.
   */
  async dispose(): Promise<void> {
    if (
      this.disposed
    ) {
      return;
    }

    this.disposed = true;
    this.loaded = false;

    for (
      const source of this.sources
    ) {
      if (
        !source.close
      ) {
        continue;
      }

      try {
        await source.close();
      } catch {
        // Continue closing remaining sources.
      }
    }

    this.sources.length = 0;
    this.lastResult = undefined;
  }

  /**
   * Detaches this loader from its source lifecycle.
   *
   * Useful for temporary loaders sharing an existing store.
   */
  private detach(): void {
    this.sources.length = 0;
    this.lastResult = undefined;
    this.disposed = true;
  }

  /**
   * Applies one source to the configuration store.
   *
   * Sources are processed from highest to lowest priority. Existing
   * values are therefore retained when a lower-priority source
   * attempts to replace them.
   */
  private applySource(
    source: ConfigSource,
    result: ConfigSourceResult,
  ): void {
    const priority =
      source.priority;

    for (
      const [
        key,
        value,
      ] of Object.entries(
        result.values,
      )
    ) {
      const existing =
        this.store.getEntry(
          key,
        );

      if (
        existing &&
        existing.priority >
          priority
      ) {
        continue;
      }

      this.store.set(
        key,
        cloneConfigValue(
          value,
        ),
        {
          source:
            source.name,
          sourceType:
            source.type,
          priority,
          sensitive:
            existing?.sensitive ??
            false,
          resolved:
            true,
        },
      );
    }
  }

  private assertActive(): void {
    if (
      this.disposed
    ) {
      throw new Error(
        "ConfigLoader has been disposed.",
      );
    }
  }
}

/**
 * Loads one source while preserving the source lifecycle contract.
 */
async function loadSingleSource(
  source: ConfigSource,
  context: ConfigSourceContext,
): Promise<
  ConfigSourceResult | undefined
> {
  if (
    source.isAvailable
  ) {
    const available =
      await source.isAvailable(
        context,
      );

    if (
      !available
    ) {
      if (
        source.optional
      ) {
        return undefined;
      }

      throw new Error(
        `Configuration source "${source.name}" is unavailable.`,
      );
    }
  }

  const result =
    await source.load(
      context,
    );

  if (
    !result ||
    typeof result !==
      "object"
  ) {
    throw new Error(
      `Configuration source "${source.name}" returned an invalid result.`,
    );
  }

  return result;
}

/**
 * Creates a configuration loader.
 */
export function createConfigLoader(
  options: ConfigLoaderOptions = {},
): ConfigLoader {
  return new ConfigLoader(
    options,
  );
}

/**
 * Loads configuration directly from a collection of sources.
 */
export async function loadConfiguration(
  sources: readonly ConfigSource[],
  options: Omit<
    ConfigLoaderOptions,
    "sources"
  > = {},
): Promise<ConfigLoadResult> {
  const loader =
    createConfigLoader({
      ...options,
      sources,
    });

  try {
    return await loader.load();
  } finally {
    await loader.dispose();
  }
}

/**
 * Converts loaded source results into configuration entries.
 */
export function sourceResultsToEntries(
  results:
    readonly ConfigSourceResult[],
  sources:
    readonly ConfigSource[],
): readonly ConfigEntry[] {
  const sourceMap =
    new Map(
      sources.map(
        (source) => [
          source.name,
          source,
        ],
      ),
    );

  const entries:
    ConfigEntry[] =
    [];

  for (
    const result of results
  ) {
    const source =
      sourceMap.get(
        result.source,
      );

    for (
      const [
        key,
        value,
      ] of Object.entries(
        result.values,
      )
    ) {
      entries.push(
        createConfigEntry({
          key,
          value,
          source:
            result.source,
          sourceType:
            result.type,
          priority:
            source?.priority ??
            0,
        }),
      );
    }
  }

  return entries;
}