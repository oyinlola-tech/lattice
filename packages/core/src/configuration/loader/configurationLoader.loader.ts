import { Configuration } from "../core/configuration.js";

import type {
  ConfigurationSource,
  ConfigurationSourceEntry,
} from "../core/configurationSource.source.js";

/**
 * Options for loading configuration.
 */
export interface ConfigurationLoaderOptions {
  /**
   * Configuration sources to load.
   */
  readonly sources?: readonly ConfigurationSource[];

  /**
   * Whether sources should be loaded sequentially.
   *
   * Defaults to true.
   *
   * Sequential loading makes priority behavior predictable
   * and allows future sources to depend on earlier sources.
   */
  readonly sequential?: boolean;
}

/**
 * Result returned by the configuration loader.
 */
export interface ConfigurationLoadResult {
  /**
   * Final merged configuration.
   */
  readonly configuration: Configuration;

  /**
   * Sources successfully loaded.
   */
  readonly sources: readonly ConfigurationSource[];

  /**
   * Number of configuration entries loaded.
   */
  readonly entryCount: number;
}

/**
 * Loads and combines configuration from multiple sources.
 *
 * The loader is intentionally independent of the actual
 * configuration source implementation.
 */
export class ConfigurationLoader {
  private readonly sources: ConfigurationSource[];

  private readonly sequential: boolean;

  public constructor(options: ConfigurationLoaderOptions = {}) {
    this.sources = [...(options.sources ?? [])];

    this.sequential = options.sequential ?? true;
  }

  /**
   * Loads all registered configuration sources.
   *
   * Sources are ordered by ascending priority.
   * Higher priority sources are therefore applied later
   * and override lower priority values.
   */
  public async load(): Promise<ConfigurationLoadResult> {
    const sources = this.getSortedSources();

    if (this.sequential) {
      return this.loadSequentially(sources);
    }

    return this.loadConcurrently(sources);
  }

  /**
   * Loads sources sequentially.
   *
   * This is the default behavior.
   */
  private async loadSequentially(
    sources: readonly ConfigurationSource[],
  ): Promise<ConfigurationLoadResult> {
    let configuration = new Configuration();

    let entryCount = 0;

    for (const source of sources) {
      const entries = await this.loadSource(source);

      configuration = this.applyEntries(configuration, entries, source);

      entryCount += entries.length;
    }

    return {
      configuration,
      sources: [...sources],
      entryCount,
    };
  }

  /**
   * Loads sources concurrently.
   *
   * Even though loading happens concurrently, entries are
   * applied according to source priority to preserve
   * deterministic precedence.
   */
  private async loadConcurrently(
    sources: readonly ConfigurationSource[],
  ): Promise<ConfigurationLoadResult> {
    const loaded = await Promise.all(
      sources.map(async (source) => ({
        source,
        entries: await this.loadSource(source),
      })),
    );

    let configuration = new Configuration();

    let entryCount = 0;

    for (const result of loaded) {
      configuration = this.applyEntries(
        configuration,
        result.entries,
        result.source,
      );

      entryCount += result.entries.length;
    }

    return {
      configuration,
      sources: [...sources],
      entryCount,
    };
  }

  /**
   * Loads a single configuration source.
   */
  private async loadSource(
    source: ConfigurationSource,
  ): Promise<readonly ConfigurationSourceEntry[]> {
    try {
      const entries = await source.load();

      return entries;
    } catch (error) {
      throw new ConfigurationLoadError(source, error);
    }
  }

  /**
   * Applies source entries to the configuration.
   */
  private applyEntries(
    configuration: Configuration,
    entries: readonly ConfigurationSourceEntry[],
    source: ConfigurationSource,
  ): Configuration {
    let result = configuration;

    for (const entry of entries) {
      const path = entry.path.trim();

      if (!path) {
        throw new ConfigurationLoadError(
          source,
          new Error("Configuration entry path cannot be empty."),
        );
      }

      result = result.with(path, entry.value, source.type);
    }

    return result;
  }

  /**
   * Returns sources ordered by priority.
   *
   * Lower priority sources are loaded first.
   * Higher priority sources override them.
   */
  private getSortedSources(): ConfigurationSource[] {
    return [...this.sources].sort((a, b) => a.priority - b.priority);
  }

  /**
   * Adds a configuration source.
   */
  public addSource(source: ConfigurationSource): void {
    this.sources.push(source);
  }

  /**
   * Returns all registered sources.
   */
  public getSources(): readonly ConfigurationSource[] {
    return [...this.sources];
  }

  /**
   * Removes a source by name.
   */
  public removeSource(name: string): boolean {
    const index = this.sources.findIndex((source) => source.name === name);

    if (index === -1) {
      return false;
    }

    this.sources.splice(index, 1);

    return true;
  }

  /**
   * Clears all registered sources.
   */
  public clearSources(): void {
    this.sources.length = 0;
  }
}

/**
 * Error thrown when a configuration source cannot be loaded.
 */
export class ConfigurationLoadError extends Error {
  public readonly source: ConfigurationSource;

  public constructor(source: ConfigurationSource, cause: unknown) {
    const message = cause instanceof Error ? cause.message : String(cause);

    super(`Failed to load configuration source "${source.name}": ${message}`);

    this.source = source;

    this.cause = cause;
  }
}

/**
 * Creates a ConfigurationLoader.
 */
export function createConfigurationLoader(
  options: ConfigurationLoaderOptions = {},
): ConfigurationLoader {
  return new ConfigurationLoader(options);
}
