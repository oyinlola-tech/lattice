import type { ContextKey } from "../../context/core/contextKey.key.js";

/**
 * Represents a configuration source.
 *
 * Sources allow configuration values to be layered later,
 * for example:
 *
 * defaults
 * environment
 * .env
 * configuration files
 * secrets
 * runtime overrides
 */
export type ConfigurationSource =
  | "default"
  | "environment"
  | "file"
  | "secret"
  | "remote"
  | "runtime"
  | "custom";

/**
 * Configuration value types supported by the core
 * configuration system.
 */
export type ConfigurationValue =
  | string
  | number
  | boolean
  | null
  | undefined
  | ConfigurationValue[]
  | {
      readonly [key: string]: ConfigurationValue;
    };

/**
 * Options used to create a Configuration instance.
 */
export interface ConfigurationOptions {
  /**
   * Initial configuration values.
   */
  readonly values?: Record<
    string,
    ConfigurationValue
  >;

  /**
   * Source associated with the supplied values.
   */
  readonly source?: ConfigurationSource;

  /**
   * Optional namespace for the configuration.
   *
   * Example:
   *
   * database
   * auth
   * redis
   */
  readonly namespace?: string;
}

/**
 * Typed configuration key.
 *
 * A configuration key can optionally carry a TypeScript type
 * so consumers can retrieve strongly typed configuration values.
 */
export interface ConfigurationKey<T> {
  /**
   * Configuration path.
   *
   * Examples:
   *
   * "database.host"
   * "database.port"
   * "auth.jwt.secret"
   */
  readonly path: string;

  /**
   * Internal unique identifier.
   */
  readonly id: symbol;
}

/**
 * Represents a configuration entry.
 */
export interface ConfigurationEntry<T = ConfigurationValue> {
  /**
   * Configuration path.
   */
  readonly path: string;

  /**
   * Stored value.
   */
  readonly value: T;

  /**
   * Source from which the value originated.
   */
  readonly source: ConfigurationSource;
}

/**
 * Immutable configuration container.
 */
export class Configuration {
  private readonly values: Readonly<
    Record<string, ConfigurationValue>
  >;

  private readonly source: ConfigurationSource;

  private readonly namespace?: string;

  public constructor(
    options: ConfigurationOptions = {},
  ) {
    this.source =
      options.source ?? "runtime";

    this.namespace =
      options.namespace;

    this.values = Object.freeze({
      ...(options.values ?? {}),
    });
  }

  /**
   * Returns the configuration namespace.
   */
  public getNamespace(): string | undefined {
    return this.namespace;
  }

  /**
   * Returns the source of this configuration.
   */
  public getSource(): ConfigurationSource {
    return this.source;
  }

  /**
   * Returns a configuration value using a string path.
   *
   * Supports nested paths:
   *
   * database.host
   * database.port
   * auth.jwt.secret
   */
  public get<T = ConfigurationValue>(
    path: string,
  ): T | undefined {
    const normalizedPath =
      this.normalizePath(path);

    if (!normalizedPath) {
      return undefined;
    }

    const parts =
      normalizedPath.split(".");

    let current: unknown =
      this.values;

    for (const part of parts) {
      if (
        typeof current !== "object" ||
        current === null ||
        !(part in current)
      ) {
        return undefined;
      }

      current = (
        current as Record<
          string,
          unknown
        >
      )[part];
    }

    return current as T;
  }

  /**
   * Returns a required configuration value.
   *
   * Throws when the value does not exist.
   */
  public require<T = ConfigurationValue>(
    path: string,
  ): T {
    const value =
      this.get<T>(path);

    if (value === undefined) {
      throw new Error(
        `Required configuration "${path}" is not defined.`,
      );
    }

    return value;
  }

  /**
   * Returns a configuration value using a typed key.
   */
  public getByKey<T>(
    key: ConfigurationKey<T>,
  ): T | undefined {
    return this.get<T>(key.path);
  }

  /**
   * Returns a required configuration value using
   * a typed key.
   */
  public requireByKey<T>(
    key: ConfigurationKey<T>,
  ): T {
    const value =
      this.getByKey(key);

    if (value === undefined) {
      throw new Error(
        `Required configuration "${key.path}" is not defined.`,
      );
    }

    return value;
  }

  /**
   * Checks whether a configuration path exists.
   */
  public has(
    path: string,
  ): boolean {
    return this.get(path) !== undefined;
  }

  /**
   * Returns a boolean configuration value.
   */
  public getBoolean(
    path: string,
    defaultValue?: boolean,
  ): boolean | undefined {
    const value =
      this.get(path);

    if (value === undefined) {
      return defaultValue;
    }

    if (typeof value === "boolean") {
      return value;
    }

    if (typeof value === "string") {
      const normalized =
        value.trim().toLowerCase();

      if (
        normalized === "true" ||
        normalized === "1" ||
        normalized === "yes"
      ) {
        return true;
      }

      if (
        normalized === "false" ||
        normalized === "0" ||
        normalized === "no"
      ) {
        return false;
      }
    }

    throw new TypeError(
      `Configuration "${path}" is not a valid boolean.`,
    );
  }

  /**
   * Returns a numeric configuration value.
   */
  public getNumber(
    path: string,
    defaultValue?: number,
  ): number | undefined {
    const value =
      this.get(path);

    if (value === undefined) {
      return defaultValue;
    }

    if (typeof value === "number") {
      if (Number.isFinite(value)) {
        return value;
      }

      throw new TypeError(
        `Configuration "${path}" must be a finite number.`,
      );
    }

    if (typeof value === "string") {
      const parsed =
        Number(value.trim());

      if (Number.isFinite(parsed)) {
        return parsed;
      }
    }

    throw new TypeError(
      `Configuration "${path}" is not a valid number.`,
    );
  }

  /**
   * Returns a string configuration value.
   */
  public getString(
    path: string,
    defaultValue?: string,
  ): string | undefined {
    const value =
      this.get(path);

    if (value === undefined) {
      return defaultValue;
    }

    if (typeof value === "string") {
      return value;
    }

    if (
      typeof value === "number" ||
      typeof value === "boolean"
    ) {
      return String(value);
    }

    throw new TypeError(
      `Configuration "${path}" is not a valid string.`,
    );
  }

  /**
   * Creates a typed configuration key.
   */
  public createKey<T>(
    path: string,
  ): ConfigurationKey<T> {
    const normalizedPath =
      this.normalizePath(path);

    if (!normalizedPath) {
      throw new Error(
        "Configuration key path cannot be empty.",
      );
    }

    return Object.freeze({
      path: normalizedPath,
      id: Symbol(normalizedPath),
    });
  }

  /**
   * Creates a child configuration containing values
   * under a specific namespace.
   *
   * Example:
   *
   * configuration.scope("database")
   *
   * Allows:
   *
   * scope.get("host")
   *
   * instead of:
   *
   * configuration.get("database.host")
   */
  public scope(
    namespace: string,
  ): Configuration {
    const normalizedNamespace =
      this.normalizePath(namespace);

    if (!normalizedNamespace) {
      throw new Error(
        "Configuration scope cannot be empty.",
      );
    }

    const scopedValues =
      this.get<Record<
        string,
        ConfigurationValue
      >>(normalizedNamespace);

    if (
      scopedValues === undefined ||
      typeof scopedValues !== "object" ||
      scopedValues === null ||
      Array.isArray(scopedValues)
    ) {
      return new Configuration({
        values: {},
        source: this.source,
        namespace: normalizedNamespace,
      });
    }

    return new Configuration({
      values: scopedValues,
      source: this.source,
      namespace: normalizedNamespace,
    });
  }

  /**
   * Returns all configuration entries.
   */
  public entries(): readonly ConfigurationEntry[] {
    return Object.entries(
      this.values,
    ).map(
      ([path, value]) => ({
        path,
        value,
        source: this.source,
      }),
    );
  }

  /**
   * Returns a plain immutable snapshot of the
   * top-level configuration values.
   */
  public toObject(): Readonly<
    Record<string, ConfigurationValue>
  > {
    return this.values;
  }

  /**
   * Creates a new Configuration instance by merging
   * another configuration into this one.
   *
   * Values from the supplied configuration take precedence.
   */
  public merge(
    other: Configuration,
  ): Configuration {
    return new Configuration({
      values: {
        ...this.values,
        ...other.toObject(),
      },
      source: other.source,
      namespace:
        other.namespace ??
        this.namespace,
    });
  }

  /**
   * Creates a new Configuration instance with a
   * single value.
   */
  public with<T extends ConfigurationValue>(
    path: string,
    value: T,
    source: ConfigurationSource = "runtime",
  ): Configuration {
    const normalizedPath =
      this.normalizePath(path);

    if (!normalizedPath) {
      throw new Error(
        "Configuration path cannot be empty.",
      );
    }

    const values =
      this.setNestedValue(
        this.values,
        normalizedPath,
        value,
      );

    return new Configuration({
      values,
      source,
      namespace:
        this.namespace,
    });
  }

  /**
   * Removes a configuration value.
   *
   * Returns a new Configuration instance.
   */
  public without(
    path: string,
  ): Configuration {
    const normalizedPath =
      this.normalizePath(path);

    if (!normalizedPath) {
      return this;
    }

    const values =
      this.deleteNestedValue(
        this.values,
        normalizedPath,
      );

    return new Configuration({
      values,
      source: this.source,
      namespace:
        this.namespace,
    });
  }

  /**
   * Normalizes a configuration path.
   */
  private normalizePath(
    path: string,
  ): string {
    return path
      .trim()
      .replace(/\s+/g, "");
  }

  /**
   * Creates an immutable nested object containing
   * the supplied value.
   */
  private setNestedValue(
    source: Readonly<
      Record<string, ConfigurationValue>
    >,
    path: string,
    value: ConfigurationValue,
  ): Record<
    string,
    ConfigurationValue
  > {
    const parts =
      path.split(".");

    const result: Record<
      string,
      ConfigurationValue
    > = {
      ...source,
    };

    let current:
      Record<string, ConfigurationValue> =
      result;

    for (
      let index = 0;
      index < parts.length - 1;
      index += 1
    ) {
      const part =
        parts[index]!;

      const existing =
        current[part];

      const nested =
        existing !== null &&
        typeof existing === "object" &&
        !Array.isArray(existing)
          ? {
              ...(existing as Record<
                string,
                ConfigurationValue
              >),
            }
          : {};

      current[part!] =
        nested;

      current =
        nested;
    }

    current[
      parts[parts.length - 1]!
    ] = value;

    return result;
  }

  /**
   * Removes a nested configuration value.
   */
  private deleteNestedValue(
    source: Readonly<
      Record<string, ConfigurationValue>
    >,
    path: string,
  ): Record<
    string,
    ConfigurationValue
  > {
    const parts =
      path.split(".");

    const result =
      structuredClone(source) as Record<
        string,
        ConfigurationValue
      >;

    let current:
      Record<string, ConfigurationValue> =
      result;

    for (
      let index = 0;
      index < parts.length - 1;
      index += 1
    ) {
      const part =
        parts[index]!;

      const next =
        current[part];

      if (
        next === null ||
        typeof next !== "object" ||
        Array.isArray(next)
      ) {
        return result;
      }

      current =
        next as Record<
          string,
          ConfigurationValue
        >;
    }

    delete current[
      parts[parts.length - 1]!
    ];

    return result;
  }
}

/**
 * Creates an empty Configuration instance.
 */
export function createConfiguration(
  options: ConfigurationOptions = {},
): Configuration {
  return new Configuration(options);
}