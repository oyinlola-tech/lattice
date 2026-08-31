/**
 * Route registry implementation.
 *
 * @module httpRoute/registry/registry
 */

import type {
  RouteRegistryEntry,
  RouteRegistryOptions,
  RouteRegistrationOptions,
  RouteLookupOptions,
  RouteRegistrySnapshot,
} from "./core/httpRegistry.type.js";

import {
  normalizeMethod,
  normalizeMethods,
  normalizePath,
  matchesLookup,
  extractSequence,
} from "./core/httpRegistry.helper.js";

export class RouteRegistry {
  private readonly routes = new Map<string, RouteRegistryEntry>();
  private readonly options: RouteRegistryOptions;
  private version = 0;

  constructor(options: RouteRegistryOptions = {}) {
    this.options = {
      caseSensitive: false,
      strict: false,
      end: true,
      ...options,
    };
  }

  register(
    path: string,
    method: string | readonly string[],
    handler: unknown,
    options: RouteRegistrationOptions = {},
  ): void {
    const normalizedPath = normalizePath(path, this.options);
    const methods = normalizeMethods(method);

    for (const m of methods) {
      const key = this.createKey(normalizedPath, m);
      const entry: RouteRegistryEntry = {
        path: normalizedPath,
        method: m,
        handler,
        options,
        metadata: options.metadata ?? {},
      };

      this.routes.set(key, entry);
      this.version++;
    }
  }

  unregister(path: string, method: string): boolean {
    const normalizedPath = normalizePath(path, this.options);
    const normalizedMethod = normalizeMethod(method);
    const key = this.createKey(normalizedPath, normalizedMethod);

    const existed = this.routes.delete(key);
    if (existed) {
      this.version++;
    }

    return existed;
  }

  lookup(path: string, options: RouteLookupOptions = {}): RouteRegistryEntry | undefined {
    const normalizedPath = normalizePath(path, this.options);
    const method = options.method ? normalizeMethod(options.method) : undefined;

    for (const entry of this.routes.values()) {
      if (matchesLookup(entry, normalizedPath, method, this.options)) {
        return entry;
      }
    }

    return undefined;
  }

  findAll(path: string, options: RouteLookupOptions = {}): readonly RouteRegistryEntry[] {
    const normalizedPath = normalizePath(path, this.options);
    const method = options.method ? normalizeMethod(options.method) : undefined;

    const results: RouteRegistryEntry[] = [];
    for (const entry of this.routes.values()) {
      if (matchesLookup(entry, normalizedPath, method, this.options)) {
        results.push(entry);
      }
    }

    return results.sort((a, b) => {
      const seqA = extractSequence(a.path);
      const seqB = extractSequence(b.path);
      return seqA - seqB;
    });
  }

  has(path: string, method: string): boolean {
    return this.lookup(path, { method }) !== undefined;
  }

  clear(): void {
    this.routes.clear();
    this.version++;
  }

  snapshot(): RouteRegistrySnapshot {
    return {
      routes: Array.from(this.routes.values()),
      timestamp: Date.now(),
      version: this.version,
    };
  }

  get size(): number {
    return this.routes.size;
  }

  get version_number(): number {
    return this.version;
  }

  private createKey(path: string, method: string): string {
    const caseSensitive = this.options.caseSensitive ?? false;
    const normalizedPath = caseSensitive ? path : path.toLowerCase();
    const normalizedMethod = caseSensitive ? method : method.toUpperCase();
    return `${normalizedMethod}:${normalizedPath}`;
  }
}
