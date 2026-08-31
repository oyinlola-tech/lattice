/**
 * Route registry group.
 *
 * @module httpRoute/registry/group
 */

import type {
  RouteRegistryEntry,
  RouteRegistryOptions,
  RouteRegistrationOptions,
  RouteLookupOptions,
} from "./core/httpRegistry.type.js";

import { RouteRegistry } from "./httpRegistry.core.js";

export class RouteRegistryGroup {
  private readonly registries = new Map<string, RouteRegistry>();
  private readonly options: RouteRegistryOptions;

  constructor(options: RouteRegistryOptions = {}) {
    this.options = options;
  }

  createGroup(
    name: string,
    options: RouteRegistryOptions = {},
  ): RouteRegistry {
    const mergedOptions = { ...this.options, ...options };
    const registry = new RouteRegistry(mergedOptions);
    this.registries.set(name, registry);
    return registry;
  }

  getGroup(name: string): RouteRegistry | undefined {
    return this.registries.get(name);
  }

  register(
    groupName: string,
    path: string,
    method: string | readonly string[],
    handler: unknown,
    options: RouteRegistrationOptions = {},
  ): void {
    const registry = this.registries.get(groupName);
    if (!registry) {
      throw new Error(`Route registry group not found: ${groupName}`);
    }
    registry.register(path, method, handler, options);
  }

  lookup(path: string, options: RouteLookupOptions = {}): RouteRegistryEntry | undefined {
    for (const registry of this.registries.values()) {
      const entry = registry.lookup(path, options);
      if (entry) {
        return entry;
      }
    }
    return undefined;
  }

  findAll(path: string, options: RouteLookupOptions = {}): readonly RouteRegistryEntry[] {
    const results: RouteRegistryEntry[] = [];
    for (const registry of this.registries.values()) {
      results.push(...registry.findAll(path, options));
    }
    return results;
  }

  has(path: string, method: string): boolean {
    for (const registry of this.registries.values()) {
      if (registry.has(path, method)) {
        return true;
      }
    }
    return false;
  }

  clear(): void {
    for (const registry of this.registries.values()) {
      registry.clear();
    }
  }

  get size(): number {
    let total = 0;
    for (const registry of this.registries.values()) {
      total += registry.size;
    }
    return total;
  }

  get groupCount(): number {
    return this.registries.size;
  }

  get groupNames(): readonly string[] {
    return Array.from(this.registries.keys());
  }
}
