/**
 * @zudo/lifecycle/internal/dependency-graph
 *
 * Directed acyclic graph for component dependency tracking.
 */

import { LifecycleDependencyError } from "@zudo/errors";

/**
 * A directed acyclic graph of component dependencies.
 */
export class DependencyGraph {
  private readonly _edges = new Map<string, Set<string>>();
  private readonly _reverseEdges = new Map<string, Set<string>>();

  /** Adds a node to the graph. */
  public addNode(id: string): void {
    if (!this._edges.has(id)) {
      this._edges.set(id, new Set());
    }
    if (!this._reverseEdges.has(id)) {
      this._reverseEdges.set(id, new Set());
    }
  }

  /** Adds a directed edge: from depends on to. */
  public addEdge(from: string, to: string): void {
    this.addNode(from);
    this.addNode(to);
    this._edges.get(from)!.add(to);
    this._reverseEdges.get(to)!.add(from);
  }

  /** Returns all nodes. */
  public getNodes(): readonly string[] {
    return [...this._edges.keys()];
  }

  /** Returns the nodes that the given node depends on. */
  public getDependencies(id: string): readonly string[] {
    return [...(this._edges.get(id) ?? [])];
  }

  /** Returns the nodes that depend on the given node. */
  public getDependents(id: string): readonly string[] {
    return [...(this._reverseEdges.get(id) ?? [])];
  }

  /**
   * Validates that the graph has no circular dependencies.
   * Throws LifecycleDependencyError with the cycle path if found.
   */
  public validate(): void {
    const visited = new Set<string>();
    const inStack = new Set<string>();
    const path: string[] = [];

    for (const node of this._edges.keys()) {
      if (!visited.has(node)) {
        this._detectCycle(node, visited, inStack, path);
      }
    }
  }

  private _detectCycle(
    node: string,
    visited: Set<string>,
    inStack: Set<string>,
    path: string[],
  ): void {
    visited.add(node);
    inStack.add(node);
    path.push(node);

    const deps = this._edges.get(node) ?? new Set();
    for (const dep of deps) {
      if (inStack.has(dep)) {
        const cycleStart = path.indexOf(dep);
        const cycle = [...path.slice(cycleStart), dep];
        throw new LifecycleDependencyError(cycle);
      }
      if (!visited.has(dep)) {
        this._detectCycle(dep, visited, inStack, path);
      }
    }

    path.pop();
    inStack.delete(node);
  }
}
