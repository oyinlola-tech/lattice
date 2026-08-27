import type {
  ConfigManagerOptions,
} from "./configManager.type.js";

import {
  ConfigManager,
} from "./configManager.core.js";

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
