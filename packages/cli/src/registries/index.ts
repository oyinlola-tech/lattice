/**
 * zudolib-cli — Registries
 *
 * Registries for adapters, generators, and dependencies.
 */

export { FrontendAdapterRegistry } from "./adapter/frontendAdapterRegistry.core.js";
export { PackageManagerRegistry } from "./adapter/packageManagerRegistry.core.js";
export {
  GeneratorRegistry,
  type GeneratorRegistryEntry,
} from "./generator/index.js";
export {
  DependencyRegistry,
  type DependencyRecord,
} from "./dependency/index.js";
