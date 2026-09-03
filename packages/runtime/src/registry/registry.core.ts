/**
 * @zudolib/runtime — Runtime Registry
 *
 * Manages multiple runtime instances for scenarios where Zudolib
 * runs multiple applications or workers in a single process.
 */

import type { Runtime } from "../runtime/runtime.core.js";

/**
 * Runtime registry for managing multiple runtime instances.
 *
 * Useful for:
 * - API server + Worker + Scheduler in one process
 * - Testing multiple runtime configurations
 * - Embedded runtimes
 */
export class RuntimeRegistry {
  private readonly runtimes = new Map<string, Runtime>();

  /**
   * Register a runtime instance.
   */
  register(id: string, runtime: Runtime): void {
    if (this.runtimes.has(id)) {
      throw new Error(`Runtime "${id}" is already registered.`);
    }
    this.runtimes.set(id, runtime);
  }

  /**
   * Unregister a runtime instance.
   */
  unregister(id: string): void {
    this.runtimes.delete(id);
  }

  /**
   * Get a runtime by ID.
   */
  get(id: string): Runtime | undefined {
    return this.runtimes.get(id);
  }

  /**
   * Get a required runtime by ID (throws if not found).
   */
  require(id: string): Runtime {
    const runtime = this.runtimes.get(id);
    if (!runtime) {
      throw new Error(`Runtime "${id}" not found.`);
    }
    return runtime;
  }

  /**
   * Check if a runtime is registered.
   */
  has(id: string): boolean {
    return this.runtimes.has(id);
  }

  /**
   * Get all registered runtime IDs.
   */
  getIds(): readonly string[] {
    return Array.from(this.runtimes.keys());
  }

  /**
   * Get all registered runtimes.
   */
  getAll(): readonly Runtime[] {
    return Array.from(this.runtimes.values());
  }

  /**
   * Get the count of registered runtimes.
   */
  get size(): number {
    return this.runtimes.size;
  }

  /**
   * Start all registered runtimes.
   */
  async startAll(): Promise<void> {
    for (const runtime of this.runtimes.values()) {
      await runtime.start();
    }
  }

  /**
   * Stop all registered runtimes.
   */
  async stopAll(): Promise<void> {
    // Stop in reverse registration order
    const runtimes = Array.from(this.runtimes.values()).reverse();
    for (const runtime of runtimes) {
      try {
        await runtime.stop();
      } catch {
        // Continue stopping other runtimes even if one fails
      }
    }
  }

  /**
   * Check if all runtimes are ready.
   */
  isAllReady(): boolean {
    for (const runtime of this.runtimes.values()) {
      if (!runtime.ready) {
        return false;
      }
    }
    return true;
  }

  /**
   * Get status of all runtimes.
   */
  getStatus(): Record<string, { state: string; ready: boolean }> {
    const result: Record<string, { state: string; ready: boolean }> = {};
    for (const [id, runtime] of this.runtimes) {
      result[id] = {
        state: runtime.state,
        ready: runtime.ready,
      };
    }
    return result;
  }

  /**
   * Clear all registered runtimes.
   */
  clear(): void {
    this.runtimes.clear();
  }
}
