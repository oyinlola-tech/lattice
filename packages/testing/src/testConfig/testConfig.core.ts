/**
 * Test configuration manager.
 *
 * Wraps the real ConfigManager with test-friendly defaults
 * for loading configuration in tests.
 */

import {
  ConfigManager,
} from "@oyinlola141/lattice-config";

import type {
  ConfigValue,
  ConfigManagerOptions,
  ConfigManagerStatus,
} from "@oyinlola141/lattice-config";

/**
 * A test configuration manager with convenience methods.
 */
export interface TestConfigManager {
  /**
   * The underlying ConfigManager instance.
   */
  readonly manager: ConfigManager;

  /**
   * Set a configuration value directly.
   */
  set: <T extends ConfigValue>(key: string, value: T) => void;

  /**
   * Get a configuration value.
   */
  get: <T extends ConfigValue = ConfigValue>(key: string) => T | undefined;

  /**
   * Load the configuration from sources.
   */
  load: () => Promise<void>;

  /**
   * Get the current manager status.
   */
  getStatus: () => ConfigManagerStatus;

  /**
   * Dispose the configuration manager.
   */
  dispose: () => Promise<void>;
}

/**
 * Creates a test configuration manager with pre-loaded values.
 *
 * @param initialValues - Optional initial configuration values.
 * @param options - Optional ConfigManager options.
 * @returns A TestConfigManager instance.
 *
 * @example
 * ```ts
 * const config = createTestConfigManager({
 *   "database.host": "localhost",
 *   "database.port": 5432,
 * });
 *
 * expect(config.get("database.host")).toBe("localhost");
 *
 * await config.dispose();
 * ```
 */
export function createTestConfigManager(
  initialValues: Readonly<Record<string, ConfigValue>> = {},
  options: Partial<ConfigManagerOptions> = {},
): TestConfigManager {
  const manager = new ConfigManager({
    initialValues,
    autoLoad: false,
    ...options,
  });

  const set = <T extends ConfigValue>(key: string, value: T): void => {
    manager.set(key, value);
  };

  const get = <T extends ConfigValue = ConfigValue>(key: string): T | undefined =>
    manager.get<T>(key);

  const load = async (): Promise<void> => {
    await manager.load();
  };

  const getStatus = (): ConfigManagerStatus => manager.getStatus();

  const dispose = async (): Promise<void> => {
    await manager.dispose();
  };

  return {
    manager,
    set,
    get,
    load,
    getStatus,
    dispose,
  };
}
