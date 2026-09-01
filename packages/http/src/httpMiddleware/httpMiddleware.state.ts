/**
 * Default HTTP middleware state implementation.
 *
 * @module httpMiddleware/state
 */

import type { HttpMiddlewareState } from "./httpMiddleware.type.js";

/* -------------------------------------------------------------------------- */
/* Default State                                                              */
/* -------------------------------------------------------------------------- */

export class DefaultHttpMiddlewareState implements HttpMiddlewareState {
  private readonly store = new Map<string, unknown>();

  get<T = unknown>(key: string): T | undefined {
    return this.store.get(key) as T | undefined;
  }

  set<T = unknown>(key: string, value: T): void {
    this.store.set(key, value);
  }

  has(key: string): boolean {
    return this.store.has(key);
  }

  delete(key: string): boolean {
    return this.store.delete(key);
  }

  clear(): void {
    this.store.clear();
  }

  entries(): IterableIterator<readonly [string, unknown]> {
    return this.store.entries();
  }
}
