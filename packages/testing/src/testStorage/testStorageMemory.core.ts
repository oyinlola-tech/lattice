/**
 * @zudo/testing — In-memory storage adapter for testing.
 *
 * A simple in-memory key-value store that satisfies the basic
 * cache adapter interface for testing without external dependencies.
 */

/** A simple in-memory store entry. */
interface StoreEntry {
  readonly value: unknown;
  readonly expiresAt: Date | null;
}

/**
 * In-memory storage adapter for testing.
 *
 * Provides basic get/set/delete/has/clear operations
 * without any external dependencies.
 */
export class InMemoryTestStorage {
  private readonly store = new Map<string, StoreEntry>();

  /** Get a value by key. */
  get<T = unknown>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (entry.expiresAt && entry.expiresAt < new Date()) {
      this.store.delete(key);
      return null;
    }
    return entry.value as T;
  }

  /** Set a value with optional TTL in milliseconds. */
  set(key: string, value: unknown, ttlMs?: number): void {
    const expiresAt = ttlMs ? new Date(Date.now() + ttlMs) : null;
    this.store.set(key, { value, expiresAt });
  }

  /** Delete a value by key. Returns true if deleted. */
  delete(key: string): boolean {
    return this.store.delete(key);
  }

  /** Check if a key exists and is not expired. */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /** Clear all entries. */
  clear(): void {
    this.store.clear();
  }

  /** Get all keys. */
  keys(): string[] {
    return [...this.store.keys()];
  }

  /** Get the number of entries. */
  get size(): number {
    return this.store.size;
  }
}
