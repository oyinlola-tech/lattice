import type { ConfigStore } from "../../configStore/configStore.core.js";

import type { ConfigResolverOptions } from "./configResolver.type.js";

import { ConfigResolver } from "./configResolver.core.js";

/**
 * Creates a configuration resolver.
 */
export function createConfigResolver(
  store: ConfigStore,
  options: ConfigResolverOptions = {},
): ConfigResolver {
  return new ConfigResolver(store, options);
}
