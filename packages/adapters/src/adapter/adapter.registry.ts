/**
 * @zudojs/adapters/adapter
 *
 * Adapter registry — manages adapter registration, lookup, and lifecycle.
 */

import type { Adapter } from "./adapter.type.js";
import type { AdapterCapabilities } from "../capabilities/capabilities.type.js";
import {
  AdapterAlreadyRegisteredError,
  AdapterNotFoundError,
} from "@zudojs/errors";

/**
 * Registry for Zudojs adapters.
 *
 * Ensures adapters are uniquely registered and provides lookup by name.
 */
export class AdapterRegistry {
  private readonly adapters = new Map<string, Adapter>();

  /**
   * Registers an adapter.
   *
   * @throws {AdapterAlreadyRegisteredError} If an adapter with the same name is already registered.
   */
  register(adapter: Adapter): void {
    const name = this.normalizeName(adapter.name);

    if (this.adapters.has(name)) {
      throw new AdapterAlreadyRegisteredError(name);
    }

    this.adapters.set(name, adapter);
  }

  /**
   * Returns an adapter by name.
   */
  get<T extends Adapter>(name: string): T | undefined {
    return this.adapters.get(this.normalizeName(name)) as T | undefined;
  }

  /**
   * Returns whether an adapter is registered.
   */
  has(name: string): boolean {
    return this.adapters.has(this.normalizeName(name));
  }

  /**
   * Removes an adapter by name.
   *
   * @returns True if the adapter was removed, false if it was not registered.
   */
  remove(name: string): boolean {
    return this.adapters.delete(this.normalizeName(name));
  }

  /**
   * Returns all registered adapters.
   */
  getAll(): readonly Adapter[] {
    return Object.freeze([...this.adapters.values()]);
  }

  /**
   * Returns all registered adapter names.
   */
  getNames(): readonly string[] {
    return Object.freeze([...this.adapters.keys()]);
  }

  /**
   * Returns the number of registered adapters.
   */
  get size(): number {
    return this.adapters.size;
  }

  /**
   * Clears all registered adapters.
   */
  clear(): void {
    this.adapters.clear();
  }

  private normalizeName(name: string): string {
    return name.trim().toLowerCase();
  }
}
