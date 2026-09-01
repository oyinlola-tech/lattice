import type { ModuleId } from "../module.js";

import type { ModuleDependencyGraph } from "./moduleDependency.type.js";

import { validateModuleDependencyGraph } from "./moduleDependency.graph.js";

/**
 * Detects circular dependencies in a module graph.
 *
 * Returns the dependency cycle when one exists.
 */
export function findModuleDependencyCycle(
  graph: ModuleDependencyGraph,
): readonly ModuleId[] | undefined {
  const visiting = new Set<ModuleId>();

  const visited = new Set<ModuleId>();

  const path: ModuleId[] = [];

  const visit = (moduleId: ModuleId): readonly ModuleId[] | undefined => {
    if (visiting.has(moduleId)) {
      const index = path.indexOf(moduleId);

      if (index >= 0) {
        return [...path.slice(index), moduleId];
      }

      return [moduleId];
    }

    if (visited.has(moduleId)) {
      return undefined;
    }

    visiting.add(moduleId);

    path.push(moduleId);

    for (const dependency of graph.getDependencies(moduleId)) {
      if (!graph.hasModule(dependency.id)) {
        continue;
      }

      const cycle = visit(dependency.id);

      if (cycle) {
        return cycle;
      }
    }

    path.pop();
    visiting.delete(moduleId);
    visited.add(moduleId);

    return undefined;
  };

  for (const moduleId of graph.nodes.keys()) {
    const cycle = visit(moduleId);

    if (cycle) {
      return cycle;
    }
  }

  return undefined;
}

/**
 * Returns true when the graph contains a circular dependency.
 */
export function hasModuleDependencyCycle(
  graph: ModuleDependencyGraph,
): boolean {
  return findModuleDependencyCycle(graph) !== undefined;
}

/**
 * Returns a topological startup order for the graph.
 *
 * Dependencies appear before the modules that depend on them.
 *
 * Example:
 *
 * users
 *   ↓
 * orders
 *   ↓
 * payments
 *
 * produces:
 *
 * users → orders → payments
 */
export function resolveModuleStartupOrder(
  graph: ModuleDependencyGraph,
): readonly ModuleId[] {
  const missing = validateModuleDependencyGraph(graph);

  if (missing.length > 0) {
    throw new Error(
      `Cannot resolve module startup order. Missing required dependencies: ${missing.join(", ")}`,
    );
  }

  const cycle = findModuleDependencyCycle(graph);

  if (cycle) {
    throw new Error(
      `Circular module dependency detected: ${cycle.join(" -> ")}`,
    );
  }

  const temporary = new Set<ModuleId>();

  const permanent = new Set<ModuleId>();

  const order: ModuleId[] = [];

  const visit = (moduleId: ModuleId): void => {
    if (permanent.has(moduleId)) {
      return;
    }

    if (temporary.has(moduleId)) {
      throw new Error(
        `Circular module dependency detected involving "${moduleId}".`,
      );
    }

    temporary.add(moduleId);

    for (const dependency of graph.getDependencies(moduleId)) {
      if (graph.hasModule(dependency.id)) {
        visit(dependency.id);
      }
    }

    temporary.delete(moduleId);

    permanent.add(moduleId);

    order.push(moduleId);
  };

  for (const moduleId of graph.nodes.keys()) {
    visit(moduleId);
  }

  return Object.freeze(order);
}

/**
 * Returns a topological shutdown order.
 *
 * Shutdown is the reverse of startup so dependent modules
 * are stopped before the modules they depend on.
 */
export function resolveModuleShutdownOrder(
  graph: ModuleDependencyGraph,
): readonly ModuleId[] {
  return Object.freeze([...resolveModuleStartupOrder(graph)].reverse());
}
