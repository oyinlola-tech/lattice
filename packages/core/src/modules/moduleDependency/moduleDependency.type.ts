import type {
  ModuleId,
} from "../module.js";

/**
 * Describes how a module depends on another module.
 */
export interface ModuleDependency {
  /**
   * Identifier of the dependency.
   */
  readonly id: ModuleId;

  /**
   * Whether the dependency is optional.
   *
   * Optional dependencies do not prevent a module from
   * loading when the dependency is unavailable.
   */
  readonly optional: boolean;

  /**
   * Optional version constraint.
   */
  readonly version?: string;
}

/**
 * A normalized collection of module dependencies.
 */
export type ModuleDependencies =
  readonly ModuleDependency[];

/**
 * Dependency graph node.
 *
 * Each node represents one module and the modules it depends on.
 */
export interface ModuleDependencyNode {
  /**
   * Module identifier.
   */
  readonly id: ModuleId;

  /**
   * Dependencies declared by the module.
   */
  readonly dependencies:
    ModuleDependencies;
}

/**
 * Complete module dependency graph.
 */
export interface ModuleDependencyGraph {
  /**
   * All modules represented by the graph.
   */
  readonly nodes:
    ReadonlyMap<
      ModuleId,
      ModuleDependencyNode
    >;

  /**
   * Returns the dependencies of a module.
   */
  getDependencies(
    moduleId: ModuleId,
  ): ModuleDependencies;

  /**
   * Returns whether the graph contains a module.
   */
  hasModule(
    moduleId: ModuleId,
  ): boolean;

  /**
   * Returns the modules that depend on the specified module.
   */
  getDependents(
    moduleId: ModuleId,
  ): readonly ModuleId[];
}

/**
 * A raw dependency declaration accepted by the framework.
 */
export type ModuleDependencyInput =
  | ModuleId
  | ModuleDependency;
