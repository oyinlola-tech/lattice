/**
 * @zudolib/storage — Storage Lifecycle Manager
 *
 * Manages the lifecycle phases of storage components:
 * uninitialized → initializing → ready → draining → drained → shutdown
 */

import { StorageError } from "@zudolib/errors";
import type {
  StorageLifecycle,
  StorageLifecyclePhase,
  StorageHealth,
} from "../types/storage.type.js";

/**
 * Lifecycle manager that coordinates storage component initialization,
 * draining, and shutdown.
 */
export class StorageLifecycleManager implements StorageLifecycle {
  private phase: StorageLifecyclePhase = "uninitialized";
  private readonly components: StorageLifecycle[] = [];

  /**
   * Register a storage component for lifecycle management.
   */
  register(component: StorageLifecycle): void {
    this.components.push(component);
  }

  async initialize(): Promise<void> {
    this.phase = "initializing";
    for (const component of this.components) {
      await component.initialize();
    }
    this.phase = "ready";
  }

  async start(): Promise<void> {
    if (this.phase !== "ready") {
      throw new StorageError(`Cannot start from phase: ${this.phase}`, {
        code: "STORAGE_LIFECYCLE_INVALID_PHASE",
        statusCode: 500,
      });
    }
    for (const component of this.components) {
      await component.start();
    }
  }

  async healthCheck(): Promise<StorageHealth> {
    const results = await Promise.allSettled(
      this.components.map((c) => c.healthCheck()),
    );

    const healthy = results.every(
      (r) => r.status === "fulfilled" && r.value.healthy,
    );

    const latencyMs = results.reduce((max, r) => {
      if (r.status === "fulfilled") {
        return Math.max(max, r.value.latencyMs);
      }
      return max;
    }, 0);

    return {
      healthy,
      latencyMs,
      status: this.phase,
      details: {
        componentCount: this.components.length,
        phases: this.components.map((c) => c.getPhase()),
      },
    };
  }

  async drain(): Promise<void> {
    this.phase = "draining";
    await Promise.all(this.components.map((c) => c.drain()));
    this.phase = "drained";
  }

  async shutdown(): Promise<void> {
    this.phase = "shutdown";
    await Promise.all(this.components.map((c) => c.shutdown()));
  }

  getPhase(): StorageLifecyclePhase {
    return this.phase;
  }
}
