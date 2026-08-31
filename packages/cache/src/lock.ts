/**
 * @lattice/cache — Lock Manager
 * Distributed lock manager for preventing concurrent cache operations.
 */

import type { CacheLock, CacheLockOptions, CacheLockStore, CacheTTL } from "./types.js";
import { DEFAULT_LOCK_RETRY_ATTEMPTS, DEFAULT_LOCK_RETRY_DELAY_MS, DEFAULT_LOCK_TTL_MS } from "./constants.js";
import { CacheError, CacheOperation } from "./errors.js";

function generateToken(): string {
  if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID === "function") {
    return globalThis.crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export class InMemoryLockStore implements CacheLockStore {
  private readonly locks = new Map<string, { token: string; expiresAt: number | null }>();

  async acquire(key: string, options?: CacheLockOptions): Promise<CacheLock | null> {
    const ttl = options?.ttl ?? DEFAULT_LOCK_TTL_MS;
    const token = generateToken();
    const now = Date.now();
    const expiresAt = now + ttl;
    const existing = this.locks.get(key);
    if (existing && existing.expiresAt !== null && now > existing.expiresAt) this.locks.delete(key);
    if (this.locks.has(key)) return null;
    this.locks.set(key, { token, expiresAt });
    return {
      key, token, acquiredAt: new Date(now), expiresAt: new Date(expiresAt),
      release: async (): Promise<boolean> => {
        const current = this.locks.get(key);
        if (current && current.token === token) { this.locks.delete(key); return true; }
        return false;
      },
      extend: async (newTtl: CacheTTL): Promise<boolean> => {
        const current = this.locks.get(key);
        if (current && current.token === token) { this.locks.set(key, { ...current, expiresAt: Date.now() + newTtl }); return true; }
        return false;
      },
    };
  }

  get size(): number { return this.locks.size; }
  clear(): void { this.locks.clear(); }
}

export class CacheLockManager {
  private readonly store: CacheLockStore;
  private readonly retryAttempts: number;
  private readonly retryDelayMs: number;

  constructor(options?: { readonly store?: CacheLockStore; readonly retryAttempts?: number; readonly retryDelayMs?: number }) {
    this.store = options?.store ?? new InMemoryLockStore();
    this.retryAttempts = options?.retryAttempts ?? DEFAULT_LOCK_RETRY_ATTEMPTS;
    this.retryDelayMs = options?.retryDelayMs ?? DEFAULT_LOCK_RETRY_DELAY_MS;
  }

  async acquire(key: string, options?: CacheLockOptions): Promise<CacheLock | null> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.retryAttempts; attempt++) {
      try {
        const lock = await this.store.acquire(key, options);
        if (lock) return lock;
      } catch (error) { lastError = error; }
      if (attempt < this.retryAttempts) await sleep(this.retryDelayMs);
    }
    if (lastError) throw new CacheError(`Failed to acquire lock "${key}" after ${this.retryAttempts} retries.`, { cause: lastError, operation: CacheOperation.LOCK_ACQUIRE, key });
    return null;
  }

  async withLock<T>(key: string, fn: () => Promise<T>, options?: CacheLockOptions): Promise<T> {
    const lock = await this.acquire(key, options);
    if (!lock) throw new CacheError(`Could not acquire lock "${key}" for exclusive operation.`, { operation: CacheOperation.LOCK_ACQUIRE, key, statusCode: 409 });
    try { return await fn(); } finally { await lock.release(); }
  }
}

function sleep(ms: number): Promise<void> { return new Promise((resolve) => setTimeout(resolve, ms)); }

export function createLockManager(options?: { readonly store?: CacheLockStore; readonly retryAttempts?: number; readonly retryDelayMs?: number }): CacheLockManager {
  return new CacheLockManager(options);
}

export const defaultLockStore = new InMemoryLockStore();
