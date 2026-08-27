import type {
  ModuleId,
} from "../module.js";

import type {
  ModuleDependency,
  ModuleDependencies,
  ModuleDependencyNode,
  ModuleDependencyGraph,
  ModuleDependencyInput,
} from "./moduleDependency.type.js";

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
