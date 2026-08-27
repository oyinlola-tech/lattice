/**
 * A strongly typed key used to access a configuration value.
 *
 * The generic type T represents the expected value associated
 * with the configuration key.
 *
 * Example:
 *
 * const portKey =
 *   createConfigurationKey<number>("app.port");
 *
 * const port =
 *   configuration.requireByKey(portKey);
 */
export interface ConfigurationKey<T> {
  /**
   * Dot separated configuration path.
   *
   * Examples:
   *
   * app.name
   * app.port
   * database.host
   * auth.jwt.secret
   */
  readonly path: string;

  /**
   * Unique identifier for this configuration key.
   *
   * Symbols prevent accidental collisions between keys that
   * happen to use the same path.
   */
  readonly id: symbol;
}

/**
 * Creates a strongly typed configuration key.
 *
 * The key itself does not contain the configuration value.
 * It only describes where that value can be found and what
 * type the caller expects it to have.
 */
export function createConfigurationKey<T>(
  path: string,
): ConfigurationKey<T> {
  const normalizedPath =
    normalizeConfigurationPath(path);

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
 * Normalizes a configuration path.
 */
function normalizeConfigurationPath(
  path: string,
): string {
  if (typeof path !== "string") {
    throw new TypeError(
      "Configuration key path must be a string.",
    );
  }

  return path
    .trim()
    .replace(/\s+/g, "");
}