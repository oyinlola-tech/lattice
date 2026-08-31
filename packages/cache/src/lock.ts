/**
 * @lattice/cache — Lock Manager
 *
 * Distributed lock manager for preventing concurrent cache operations.
 * Provides acquire, release, and extend semantics with configurable
 * retry logic.
 */

import type {
  CacheLock,
  CacheLockOptions,
  CacheLockStore,
  CacheTTL,
} from "./types.js";
import {
  DEFAULT_LOCK_RETRY_ATTEMPTS,
  DEFAULT_LOCK_RETRY_DELAY_MS,
  DEFAULT_LOCK_TTL_MS,
} from "./constants.js";
import { CacheError, CacheOperation } from "./errors.js";

/* -------------------------------------------------------------------------- */
/* UUID Generator                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Generates a cryptographically random token for lock ownership.
 * Uses `crypto.randomUUID()` when available (Node 19+), otherwise
 * falls back to a simple random hex string.
 */
function generateToken(): string {
  if (
    typeof globalThis.crypto !== "undefined" &&
    typeof globalThis.crypto.randomUUID ===
      "function"
  ) {
    return globalThis.crypto.randomUUID();
  }

  // Fallback for older environments
  const bytes = new Uint8Array(16);
  for (let i = 0; i < 16; i++) {
    bytes[i] = Math.floor(Math.random() * 256);
  }
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/* -------------------------------------------------------------------------- */
/* In-Memory Lock Store                                                       */
/* -------------------------------------------------------------------------- */

/**
 * In-memory lock store for single-process scenarios.
 *
 * For distributed locking, implement `CacheLockStore` backed
 * by Redis, etcd, or a database.
 */
export class InMemoryLockStore implements CacheLockStore {
  private readonly locks = new Map<
    string,
    {
      token: string;
      expiresAt: number | null;
    }
  >();

  async acquire(
    key: string,
    options?: CacheLockOptions,
  ): Promise<CacheLock | null> {
    const ttl = options?.ttl ?? DEFAULT_LOCK_TTL_MS;
    const token = generateToken();
    const now = Date.now();
    const expiresAt = now + ttl;

    const existing = this.locks.get(key);

    // Check if existing lock is expired
    if (
      existing &&
      existing.expiresAt !== null &&
      now > existing.expiresAt
    ) {
      this.locks.delete(key);
    }

    // If lock exists and is valid, return null (cannot acquire)
    if (this.locks.has(key)) {
      return null;
    }

    // Acquire the lock
    this.locks.set(key, {
      token,
      expiresAt,
    });

    return {
      key,
      token,
      acquiredAt: new Date(now),
      expiresAt: new Date(expiresAt),

      release: async (): Promise<boolean> => {
        const current = this.locks.get(key);
        if (
          current &&
          current.token === token
        ) {
          this.locks.delete(key);
          return true;
        }
        return false;
      },

      extend: async (
        newTtl: CacheTTL,
      ): Promise<boolean> => {
        const current = this.locks.get(key);
        if (
          current &&
          current.token === token
        ) {
          const newExpiresAt = Date.now() + newTtl;
          this.locks.set(key, {
            ...current,
            expiresAt: newExpiresAt,
          });
          return true;
        }
        return false;
      },
    };
  }

  /** Returns the number of currently held locks. */
  get size(): number {
    return this.locks.size;
  }

  /** Clears all locks. */
  clear(): void {
    this.locks.clear();
  }
}

/* -------------------------------------------------------------------------- */
/* Lock Manager with Retry                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Wraps a `CacheLockStore` with automatic retry logic.
 */
export class CacheLockManager {
  private readonly store: CacheLockStore;
  private readonly retryAttempts: number;
  private readonly retryDelayMs: number;

  constructor(options?: {
    readonly store?: CacheLockStore;
    readonly retryAttempts?: number;
    readonly retryDelayMs?: number;
  }) {
    this.store =
      options?.store ?? new InMemoryLockStore();
    this.retryAttempts =
      options?.retryAttempts ??
      DEFAULT_LOCK_RETRY_ATTEMPTS;
    this.retryDelayMs =
      options?.retryDelayMs ??
      DEFAULT_LOCK_RETRY_DELAY_MS;
  }

  /**
   * Acquires a lock with automatic retry.
   *
   * Retries up to `retryAttempts` times with
   * `retryDelayMs` between attempts.
   */
  async acquire(
    key: string,
    options?: CacheLockOptions,
  ): Promise<CacheLock | null> {
    let lastError: unknown;

    for (
      let attempt = 0;
      attempt <= this.retryAttempts;
      attempt++
    ) {
      try {
        const lock = await this.store.acquire(
          key,
          options,
        );
        if (lock) return lock;
      } catch (error) {
        lastError = error;
      }

      // Wait before retrying (except on last attempt)
      if (attempt < this.retryAttempts) {
        await sleep(this.retryDelayMs);
      }
    }

    if (lastError) {
      throw new CacheError(
        `Failed to acquire lock "${key}" after ${this.retryAttempts} retries.`,
        {
          cause: lastError,
          operation: CacheOperation.LOCK_ACQUIRE,
          key,
        },
      );
    }

    return null;
  }

  /**
   * Executes a function while holding a lock.
   *
   * Automatically acquires the lock, runs the function,
   * and releases the lock when done.
   */
  async withLock<T>(
    key: string,
    fn: () => Promise<T>,
    options?: CacheLockOptions,
  ): Promise<T> {
    const lock = await this.acquire(key, options);

    if (!lock) {
      throw new CacheError(
        `Could not acquire lock "${key}" for exclusive operation.`,
        {
          operation: CacheOperation.LOCK_ACQUIRE,
          key,
          statusCode: 409,
        },
      );
    }

    try {
      return await fn();
    } finally {
      await lock.release();
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Utilities                                                                  */
/* -------------------------------------------------------------------------- */

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) =>
    setTimeout(resolve, ms),
  );
}

/* -------------------------------------------------------------------------- */
/* Factory                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Creates a lock manager with retry logic.
 */
export function createLockManager(options?: {
  readonly store?: CacheLockStore;
  readonly retryAttempts?: number;
  readonly retryDelayMs?: number;
}): CacheLockManager {
  return new CacheLockManager(options);
}

/** Default in-memory lock store singleton. */
export const defaultLockStore =
  new InMemoryLockStore();
