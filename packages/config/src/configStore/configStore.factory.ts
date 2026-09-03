/**
 * @zudolib/config/configStore/configStore.factory
 *
 * Factory and utility functions for ConfigStore.
 */

export { normalizeKey } from "./configStore.core.js";

import type { ConfigStoreOptions } from "./configStore.type.js";

import { ConfigStore } from "./configStore.core.js";

/**
 * Creates a configuration store.
 */
export function createConfigStore(
  options: ConfigStoreOptions = {},
): ConfigStore {
  return new ConfigStore(options);
}
