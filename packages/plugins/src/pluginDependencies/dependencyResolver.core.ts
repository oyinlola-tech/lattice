import type { PluginDependency } from "../pluginTypes/pluginDependency.type.js";
import {
  PluginDependencyCycleError,
  PluginDependencyError,
} from "@zudojs/errors";

/**
 * Result of dependency resolution.
 */
export interface DependencyResolution {
  readonly ordered: readonly string[];

  readonly missing: readonly string[];

  readonly cycles: readonly string[];
}

/**
 * Resolves plugin dependencies and determines startup order.
 */
export class DependencyResolver {
  /**
   * Resolves dependencies for the given plugins.
   */
  public resolve(
    plugins: Map<
      string,
      {
        readonly dependencies?: readonly PluginDependency[];
        readonly optionalDependencies?: readonly PluginDependency[];
      }
    >,
  ): DependencyResolution {
    const missing: string[] = [];
    const cycles: string[] = [];

    for (const [name, plugin] of plugins) {
      for (const dep of plugin.dependencies ?? []) {
        if (!plugins.has(dep.name)) {
          missing.push(dep.name);
        }
      }
    }

    if (missing.length > 0) {
      return { ordered: [], missing, cycles };
    }

    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    for (const name of plugins.keys()) {
      if (!visited.has(name)) {
        const cycle = this.dfs(name, plugins, visited, visiting, order);
        if (cycle) {
          cycles.push(cycle);
        }
      }
    }

    if (cycles.length > 0) {
      return { ordered: [], missing, cycles };
    }

    return {
      ordered: Object.freeze(order),
      missing,
      cycles: Object.freeze(cycles),
    };
  }

  private dfs(
    name: string,
    plugins: Map<
      string,
      {
        readonly dependencies?: readonly PluginDependency[];
        readonly optionalDependencies?: readonly PluginDependency[];
      }
    >,
    visited: Set<string>,
    visiting: Set<string>,
    order: string[],
  ): string | undefined {
    if (visiting.has(name)) {
      const cycle = this.extractCycle(name, visiting);
      return cycle;
    }

    if (visited.has(name)) {
      return undefined;
    }

    visiting.add(name);

    const plugin = plugins.get(name);
    const deps = plugin?.dependencies ?? [];

    for (const dep of deps) {
      const cycle = this.dfs(dep.name, plugins, visited, visiting, order);
      if (cycle) {
        return cycle;
      }
    }

    visiting.delete(name);
    visited.add(name);
    order.push(name);

    return undefined;
  }

  private extractCycle(entryPoint: string, visiting: Set<string>): string {
    const cycle: string[] = [entryPoint];
    let current = entryPoint;

    const entries = Array.from(visiting);
    const startIndex = entries.indexOf(current);
    for (let i = startIndex + 1; i < entries.length; i++) {
      cycle.push(entries[i]!);
      current = entries[i]!;
    }
    cycle.push(entryPoint);

    return cycle.join(" -> ");
  }
}

/**
 * Throws if the dependency resolution has errors.
 */
export function assertResolutionValid(resolution: DependencyResolution): void {
  if (resolution.missing.length > 0) {
    throw new PluginDependencyError(
      resolution.missing[0]!,
      resolution.missing[0]!,
    );
  }

  if (resolution.cycles.length > 0) {
    throw new PluginDependencyCycleError(resolution.cycles[0]!.split(" -> "));
  }
}
