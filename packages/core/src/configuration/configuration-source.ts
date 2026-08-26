import type {
  ConfigurationValue,
} from "./configuration.js";

/**
 * Well-known configuration source types.
 *
 * These describe where configuration values originate.
 */
export type ConfigurationSourceType =
  | "default"
  | "environment"
  | "file"
  | "secret"
  | "remote"
  | "runtime"
  | "custom";

/**
 * A single configuration value supplied by a source.
 */
export interface ConfigurationSourceEntry {
  /**
   * Dot-separated configuration path.
   *
   * Example:
   *
   * database.host
   */
  readonly path: string;

  /**
   * Configuration value.
   */
  readonly value: ConfigurationValue;

  /**
   * Optional source-specific metadata.
   */
  readonly metadata?: Readonly<
    Record<string, unknown>
  >;
}

/**
 * Represents a source of configuration values.
 *
 * Sources are intentionally asynchronous because a source
 * may eventually retrieve values from:
 *
 * a file
 * a remote configuration service
 * a secrets manager
 * a database
 * an external provider
 */
export interface ConfigurationSource {
  /**
   * Unique name of this configuration source.
   */
  readonly name: string;

  /**
   * Type of configuration source.
   */
  readonly type: ConfigurationSourceType;

  /**
   * Priority used when multiple sources provide the same
   * configuration value.
   *
   * Higher priority values override lower priority values.
   */
  readonly priority: number;

  /**
   * Loads configuration entries from the source.
   */
  load(): Promise<
    readonly ConfigurationSourceEntry[]
  >;
}

/**
 * Options used to create a configuration source.
 */
export interface ConfigurationSourceOptions {
  /**
   * Human-readable source name.
   */
  readonly name: string;

  /**
   * Source type.
   */
  readonly type: ConfigurationSourceType;

  /**
   * Source priority.
   *
   * Defaults to 0.
   */
  readonly priority?: number;
}

/**
 * Base implementation for configuration sources.
 *
 * Concrete sources can extend this class and implement
 * the load() method.
 */
export abstract class BaseConfigurationSource
  implements ConfigurationSource
{
  public readonly name: string;

  public readonly type: ConfigurationSourceType;

  public readonly priority: number;

  protected constructor(
    options: ConfigurationSourceOptions,
  ) {
    const name =
      options.name.trim();

    if (!name) {
      throw new Error(
        "Configuration source name cannot be empty.",
      );
    }

    if (
      !Number.isFinite(
        options.priority ?? 0,
      )
    ) {
      throw new TypeError(
        "Configuration source priority must be a finite number.",
      );
    }

    this.name = name;
    this.type = options.type;
    this.priority =
      options.priority ?? 0;
  }

  /**
   * Loads configuration entries.
   */
  public abstract load(): Promise<
    readonly ConfigurationSourceEntry[]
  >;
}

/**
 * Creates a configuration source from a loader function.
 *
 * Useful for simple custom configuration sources without
 * creating a complete class.
 */
export function createConfigurationSource(
  options: ConfigurationSourceOptions & {
    readonly load: () => Promise<
      readonly ConfigurationSourceEntry[]
    >;
  },
): ConfigurationSource {
  const name =
    options.name.trim();

  if (!name) {
    throw new Error(
      "Configuration source name cannot be empty.",
    );
  }

  if (
    !Number.isFinite(
      options.priority ?? 0,
    )
  ) {
    throw new TypeError(
      "Configuration source priority must be a finite number.",
    );
  }

  return Object.freeze({
    name,
    type: options.type,
    priority:
      options.priority ?? 0,
    load: options.load,
  });
}

/**
 * Sorts configuration sources according to their priority.
 *
 * Lower priority sources are loaded first.
 * Higher priority sources are loaded last and therefore
 * take precedence when values are merged.
 */
export function sortConfigurationSources(
  sources: readonly ConfigurationSource[],
): ConfigurationSource[] {
  return [...sources].sort(
    (a, b) =>
      a.priority - b.priority,
  );
}