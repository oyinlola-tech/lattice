/**
 * zudolib-cli — Resolvers
 *
 * Architecture and project resolution utilities.
 */

export { detectArchitecture } from "./architecture.resolver.js";
export { resolveProjectPath, findProjectRoot } from "./project.resolver.js";
export {
  CapabilityResolver,
  type CapabilityDependency,
  type CapabilityResolutionResult,
} from "./capability/index.js";
export {
  ConfigurationResolver,
  type ResolvedConfiguration,
} from "./configuration/index.js";
