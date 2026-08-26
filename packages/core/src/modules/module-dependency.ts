import type {
  ModuleId,
} from "./module.js";

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

/**
 * Normalizes a dependency declaration.
 */
export function normalizeModuleDependency(
  dependency: ModuleDependencyInput,
): ModuleDependency {
  if (
    typeof dependency ===
    "string"
  ) {
    const id =
      dependency.trim();

    if (!id) {
      throw new TypeError(
        "Module dependency id cannot be empty.",
      );
    }

    return Object.freeze({
      id,
      optional: false,
    });
  }

  const id =
    dependency.id?.trim();

  if (!id) {
    throw new TypeError(
      "Module dependency id cannot be empty.",
    );
  }

  return Object.freeze({
    id,
    optional:
      dependency.optional ??
      false,
    version:
      normalizeVersionConstraint(
        dependency.version,
      ),
  });
}

/**
 * Normalizes a list of dependency declarations.
 */
export function normalizeModuleDependencies(
  dependencies:
    | readonly ModuleDependencyInput[]
    | undefined,
): ModuleDependencies {
  if (
    !dependencies ||
    dependencies.length === 0
  ) {
    return [];
  }

  const normalized: ModuleDependency[] =
    [];

  const seen =
    new Set<ModuleId>();

  for (
    const dependency of dependencies
  ) {
    const item =
      normalizeModuleDependency(
        dependency,
      );

    if (seen.has(item.id)) {
      throw new TypeError(
        `Module dependency "${item.id}" is declared more than once.`,
      );
    }

    seen.add(item.id);
    normalized.push(item);
  }

  return Object.freeze(
    normalized,
  );
}

/**
 * Validates dependencies declared by a module.
 */
export function validateModuleDependencies(
  moduleId: ModuleId,
  dependencies:
    ModuleDependencies,
): void {
  const normalizedModuleId =
    moduleId.trim();

  if (!normalizedModuleId) {
    throw new TypeError(
      "Module id cannot be empty.",
    );
  }

  for (
    const dependency of dependencies
  ) {
    if (
      dependency.id ===
      normalizedModuleId
    ) {
      throw new TypeError(
        `Module "${normalizedModuleId}" cannot depend on itself.`,
      );
    }

    if (
      dependency.version !==
      undefined &&
      !isValidVersionConstraint(
        dependency.version,
      )
    ) {
      throw new TypeError(
        `Invalid version constraint "${dependency.version}" for module dependency "${dependency.id}".`,
      );
    }
  }
}

/**
 * Creates a dependency graph from module dependency nodes.
 *
 * This function validates duplicate nodes and self-dependencies,
 * but deliberately does not perform topological sorting.
 */
export function createModuleDependencyGraph(
  nodes:
    readonly ModuleDependencyNode[],
): ModuleDependencyGraph {
  const nodeMap =
    new Map<
      ModuleId,
      ModuleDependencyNode
    >();

  for (const node of nodes) {
    const id =
      node.id.trim();

    if (!id) {
      throw new TypeError(
        "Module dependency graph nodes require a non-empty id.",
      );
    }

    if (nodeMap.has(id)) {
      throw new TypeError(
        `Module "${id}" appears more than once in the dependency graph.`,
      );
    }

    const dependencies =
      normalizeModuleDependencies(
        node.dependencies,
      );

    validateModuleDependencies(
      id,
      dependencies,
    );

    nodeMap.set(
      id,
      Object.freeze({
        id,
        dependencies,
      }),
    );
  }

  const readonlyNodes =
    new Map(nodeMap);

  return {
    nodes: readonlyNodes,

    getDependencies(
      moduleId: ModuleId,
    ): ModuleDependencies {
      return (
        readonlyNodes.get(
          moduleId,
        )?.dependencies ?? []
      );
    },

    hasModule(
      moduleId: ModuleId,
    ): boolean {
      return readonlyNodes.has(
        moduleId,
      );
    },

    getDependents(
      moduleId: ModuleId,
    ): readonly ModuleId[] {
      const dependents: ModuleId[] =
        [];

      for (
        const node of readonlyNodes.values()
      ) {
        if (
          node.dependencies.some(
            (dependency) =>
              dependency.id ===
              moduleId,
          )
        ) {
          dependents.push(
            node.id,
          );
        }
      }

      return dependents;
    },
  };
}

/**
 * Detects circular dependencies in a module graph.
 *
 * Returns the dependency cycle when one exists.
 */
export function findModuleDependencyCycle(
  graph: ModuleDependencyGraph,
):
  | readonly ModuleId[]
  | undefined {
  const visiting =
    new Set<ModuleId>();

  const visited =
    new Set<ModuleId>();

  const path: ModuleId[] =
    [];

  const visit = (
    moduleId: ModuleId,
  ):
    | readonly ModuleId[]
    | undefined => {
    if (visiting.has(moduleId)) {
      const index =
        path.indexOf(
          moduleId,
        );

      if (index >= 0) {
        return [
          ...path.slice(index),
          moduleId,
        ];
      }

      return [
        moduleId,
      ];
    }

    if (visited.has(moduleId)) {
      return undefined;
    }

    visiting.add(
      moduleId,
    );

    path.push(
      moduleId,
    );

    for (
      const dependency of graph.getDependencies(
        moduleId,
      )
    ) {
      if (
        !graph.hasModule(
          dependency.id,
        )
      ) {
        continue;
      }

      const cycle =
        visit(
          dependency.id,
        );

      if (cycle) {
        return cycle;
      }
    }

    path.pop();
    visiting.delete(
      moduleId,
    );
    visited.add(
      moduleId,
    );

    return undefined;
  };

  for (
    const moduleId of graph.nodes.keys()
  ) {
    const cycle =
      visit(moduleId);

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
  return (
    findModuleDependencyCycle(
      graph,
    ) !== undefined
  );
}

/**
 * Validates that all required dependencies exist.
 *
 * Optional dependencies are intentionally ignored when missing.
 */
export function validateModuleDependencyGraph(
  graph: ModuleDependencyGraph,
): readonly ModuleId[] {
  const missing: ModuleId[] =
    [];

  for (
    const node of graph.nodes.values()
  ) {
    for (
      const dependency of node.dependencies
    ) {
      if (
        dependency.optional
      ) {
        continue;
      }

      if (
        !graph.hasModule(
          dependency.id,
        )
      ) {
        missing.push(
          dependency.id,
        );
      }
    }
  }

  return Object.freeze([
    ...new Set(missing),
  ]);
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
  const missing =
    validateModuleDependencyGraph(
      graph,
    );

  if (missing.length > 0) {
    throw new Error(
      `Cannot resolve module startup order. Missing required dependencies: ${missing.join(", ")}`,
    );
  }

  const cycle =
    findModuleDependencyCycle(
      graph,
    );

  if (cycle) {
    throw new Error(
      `Circular module dependency detected: ${cycle.join(" -> ")}`,
    );
  }

  const temporary =
    new Set<ModuleId>();

  const permanent =
    new Set<ModuleId>();

  const order: ModuleId[] =
    [];

  const visit = (
    moduleId: ModuleId,
  ): void => {
    if (
      permanent.has(moduleId)
    ) {
      return;
    }

    if (
      temporary.has(moduleId)
    ) {
      throw new Error(
        `Circular module dependency detected involving "${moduleId}".`,
      );
    }

    temporary.add(
      moduleId,
    );

    for (
      const dependency of graph.getDependencies(
        moduleId,
      )
    ) {
      if (
        graph.hasModule(
          dependency.id,
        )
      ) {
        visit(
          dependency.id,
        );
      }
    }

    temporary.delete(
      moduleId,
    );

    permanent.add(
      moduleId,
    );

    order.push(
      moduleId,
    );
  };

  for (
    const moduleId of graph.nodes.keys()
  ) {
    visit(moduleId);
  }

  return Object.freeze(
    order,
  );
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
  return Object.freeze([
    ...resolveModuleStartupOrder(
      graph,
    ),
  ].reverse());
}

/**
 * Creates a dependency declaration.
 */
export function createModuleDependency(
  id: ModuleId,
  options: {
    readonly optional?: boolean;
    readonly version?: string;
  } = {},
): ModuleDependency {
  return normalizeModuleDependency({
    id,
    optional:
      options.optional ??
      false,
    version:
      options.version,
  });
}

/**
 * Checks whether a dependency is optional.
 */
export function isOptionalModuleDependency(
  dependency: ModuleDependency,
): boolean {
  return dependency.optional;
}

/**
 * Checks whether a dependency has a version constraint.
 */
export function hasModuleVersionConstraint(
  dependency: ModuleDependency,
): boolean {
  return (
    dependency.version !==
    undefined
  );
}

/**
 * Normalizes a semantic version constraint.
 *
 * This is intentionally lightweight. Full version-range
 * resolution belongs to a higher-level package.
 */
function normalizeVersionConstraint(
  value:
    | string
    | undefined,
): string | undefined {
  if (
    value === undefined
  ) {
    return undefined;
  }

  const normalized =
    value.trim();

  return normalized.length > 0
    ? normalized
    : undefined;
}

/**
 * Basic validation for supported version constraints.
 *
 * Examples:
 *
 * 1.0.0
 * ^1.0.0
 * ~1.2.0
 * >=1.0.0
 * <=2.0.0
 * >1.0.0
 * <2.0.0
 */
function isValidVersionConstraint(
  value: string,
): boolean {
  return /^(?:[<>=~^]*\s*)?\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\s*)$/.test(
    value,
  );
}