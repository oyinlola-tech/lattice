/**
 * Frontend adapter registry.
 *
 * @module registries/adapter
 */

import type { FrontendAdapter } from "../../adapters/frontend/frontendAdapter.type.js";
import { ReactAdapter } from "../../adapters/frontend/react.adapter.js";
import { NextAdapter } from "../../adapters/frontend/next.adapter.js";
import { VanillaAdapter } from "../../adapters/frontend/vanilla.adapter.js";

/**
 * Registry for frontend adapters.
 */
export class FrontendAdapterRegistry {
  private readonly adapters = new Map<string, FrontendAdapter>();

  constructor() {
    this.register(new ReactAdapter());
    this.register(new NextAdapter());
    this.register(new VanillaAdapter());
  }

  /**
   * Registers a new frontend adapter.
   */
  register(adapter: FrontendAdapter): void {
    this.adapters.set(adapter.name, adapter);
  }

  /**
   * Gets an adapter by name.
   */
  get(name: string): FrontendAdapter | undefined {
    return this.adapters.get(name);
  }

  /**
   * Gets all registered adapter names.
   */
  getNames(): readonly string[] {
    return Array.from(this.adapters.keys());
  }

  /**
   * Gets all registered adapters.
   */
  getAll(): readonly FrontendAdapter[] {
    return Array.from(this.adapters.values());
  }
}
