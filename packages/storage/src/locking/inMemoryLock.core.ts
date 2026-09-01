/**
 * @oyinlola141/lattice-storage — In-Memory Lock Manager
 *
 * Provides distributed-style locking for single-process scenarios.
 * For multi-process/multi-node, replace with Redis/Database-backed lock.
 */

import { randomBytes } from "node:crypto";
import type {
  Lock,
  LockManager,
  LockOptions,
} from "../types/storage.type.js";

/** Default lock options. */
const DEFAULT_LOCK_OPTIONS: LockOptions = {
  timeout: 10_000,
  ttl: 30_000,
  retryInterval: 100,
};

interface LockEntry {
  lockId: string;
  resource: string;
  acquiredAt: Date;
  expiresAt: Date;
}

/**
 * In-memory lock manager implementation.
 */
export class InMemoryLockManager implements LockManager {
  private readonly locks = new Map<string, LockEntry>();
  private readonly waitQueues = new Map<
    string,
    Array<{
      resolve: () => void;
      timer: ReturnType<typeof setTimeout>;
    }>
  >();

  async acquire(resource: string, options?: LockOptions): Promise<Lock> {
    const opts = { ...DEFAULT_LOCK_OPTIONS, ...options };
    const deadline = Date.now() + opts.timeout;

    while (Date.now() < deadline) {
      const lock = this.tryAcquireLock(resource, opts.ttl);
      if (lock) return lock;

      // Wait before retrying
      await new Promise((resolve) => setTimeout(resolve, opts.retryInterval));
    }

    throw new Error(
      `Failed to acquire lock on "${resource}" within ${opts.timeout}ms`,
    );
  }

  async tryAcquire(resource: string, ttlMs: number): Promise<Lock | null> {
    return this.tryAcquireLock(resource, ttlMs);
  }

  async isLocked(resource: string): Promise<boolean> {
    const entry = this.locks.get(resource);
    if (!entry) return false;

    if (Date.now() > entry.expiresAt.getTime()) {
      this.locks.delete(resource);
      return false;
    }

    return true;
  }

  /**
   * Clean up expired locks.
   */
  cleanup(): void {
    const now = Date.now();
    for (const [resource, entry] of this.locks) {
      if (now > entry.expiresAt.getTime()) {
        this.locks.delete(resource);
        this.notifyWaiters(resource);
      }
    }
  }

  /**
   * Release all locks and clean up.
   */
  clear(): void {
    this.locks.clear();
    for (const queue of this.waitQueues.values()) {
      for (const waiter of queue) {
        clearTimeout(waiter.timer);
      }
    }
    this.waitQueues.clear();
  }

  private tryAcquireLock(resource: string, ttlMs: number): Lock | null {
    this.cleanup();

    const existing = this.locks.get(resource);
    if (existing) {
      if (Date.now() > existing.expiresAt.getTime()) {
        this.locks.delete(resource);
      } else {
        return null;
      }
    }

    const lockId = randomBytes(16).toString("hex");
    const acquiredAt = new Date();
    const expiresAt = new Date(Date.now() + ttlMs);

    const entry: LockEntry = { lockId, resource, acquiredAt, expiresAt };
    this.locks.set(resource, entry);

    return {
      lockId,
      resource,
      acquiredAt,
      get expiresAt() { return entry.expiresAt; },
      release: async () => {
        const current = this.locks.get(resource);
        if (current?.lockId === lockId) {
          this.locks.delete(resource);
          this.notifyWaiters(resource);
        }
      },
      extend: async (durationMs: number) => {
        const current = this.locks.get(resource);
        if (current?.lockId === lockId) {
          current.expiresAt = new Date(Date.now() + durationMs);
        }
      },
    };
  }

  private notifyWaiters(resource: string): void {
    const queue = this.waitQueues.get(resource);
    if (queue && queue.length > 0) {
      const waiter = queue.shift()!;
      clearTimeout(waiter.timer);
      waiter.resolve();
    }
  }
}
