/**
 * @zudojs/plugins/pluginDependencies
 *
 * Plugin dependency resolution, topological sorting, and cycle detection.
 */

export type { DependencyResolution } from "./dependencyResolver.core.js";
export {
  DependencyResolver,
  assertResolutionValid,
} from "./dependencyResolver.core.js";
