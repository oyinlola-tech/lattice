/**
 * Represents a node in the module dependency graph.
 */
export interface DependencyNode {
  readonly moduleId: string;
  readonly dependencies: readonly string[];
  readonly dependents: readonly string[];
  readonly depth: number;
}

/**
 * Module dependency graph for topological ordering.
 */
export interface DependencyGraph {
  readonly nodes: ReadonlyMap<string, DependencyNode>;
  readonly ordered: readonly string[];
  readonly hasCircularDependency: boolean;
  readonly circularDependencies: readonly (readonly string[])[];
}

/**
 * Result of dependency resolution.
 */
export interface DependencyResolutionResult {
  readonly order: readonly string[];
  readonly parallelGroups: readonly (readonly string[])[];
  readonly hasCircularDependency: boolean;
  readonly circularDependencies: readonly (readonly string[])[];
}

/**
 * A group of modules that can be initialized concurrently.
 */
export interface ParallelModuleGroup {
  readonly modules: readonly string[];
  readonly depth: number;
}

/**
 * Error information for circular dependencies.
 */
export interface CircularDependencyInfo {
  readonly cycle: readonly string[];
  readonly moduleId: string;
  readonly dependencyId: string;
}
