/**
 * Module dependency graph and resolution.
 */

export {
  buildDependencyGraph,
  resolveDependencies,
  getParallelGroups,
  validateDependencies,
} from "./dependencyGraph.core.js";

export type {
  DependencyNode,
  DependencyGraph,
  DependencyResolutionResult,
  ParallelModuleGroup,
  CircularDependencyInfo,
} from "./dependencyGraph.type.js";
