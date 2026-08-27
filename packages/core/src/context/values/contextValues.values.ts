import type {
  ContextKey,
  ContextValueStore,
} from "../core/contextKey.key.js";
import {
  getContextValue,
  hasContextValue,
  requireContextValue,
} from "../core/contextKey.key.js";

/**
 * Immutable, strongly typed storage for values associated
 * with an ExecutionContext.
 *
 * ContextValues keeps application scoped values separate from
 * the fixed properties of ExecutionContext.
 */
export class ContextValues {
  private readonly values: ContextValueStore;

  /**
   * Creates a ContextValues instance.
   *
   * An optional initial store can be supplied when deriving
   * a new context value collection.
   */
  public constructor(
    values?: ContextValueStore,
  ) {
    this.values = new Map(
      values ?? [],
    );
  }

  /**
   * Returns a value associated with a context key.
   *
   * Returns undefined when the value does not exist.
   */
  public get<T>(
    key: ContextKey<T>,
  ): T | undefined {
    return getContextValue(
      this.values,
      key,
    );
  }

  /**
   * Returns a required context value.
   *
   * Throws when the value does not exist.
   */
  public require<T>(
    key: ContextKey<T>,
  ): T {
    return requireContextValue(
      this.values,
      key,
    );
  }

  /**
   * Checks whether a value exists for the supplied key.
   */
  public has<T>(
    key: ContextKey<T>,
  ): boolean {
    return hasContextValue(
      this.values,
      key,
    );
  }

  /**
   * Returns a new ContextValues instance with
   * the supplied value added or replaced.
   */
  public set<T>(
    key: ContextKey<T>,
    value: T,
  ): ContextValues {
    const values = new Map(
      this.values,
    );

    values.set(
      key.id,
      value,
    );

    return new ContextValues(
      values,
    );
  }

  /**
   * Returns a new ContextValues instance with
   * the supplied key removed.
   */
  public delete<T>(
    key: ContextKey<T>,
  ): ContextValues {
    const values = new Map(
      this.values,
    );

    values.delete(
      key.id,
    );

    return new ContextValues(
      values,
    );
  }

  /**
   * Returns a new ContextValues instance without
   * any stored values.
   */
  public clear(): ContextValues {
    return new ContextValues();
  }

  /**
   * Returns the number of stored context values.
   */
  public size(): number {
    return this.values.size;
  }

  /**
   * Returns whether no values are stored.
   */
  public isEmpty(): boolean {
    return this.values.size === 0;
  }

  /**
   * Creates a new ContextValues instance containing
   * all existing values plus the supplied values.
   */
  public merge(
    other: ContextValues,
  ): ContextValues {
    const values = new Map(
      this.values,
    );

    for (
      const [key, value] of other.values
    ) {
      values.set(
        key,
        value,
      );
    }

    return new ContextValues(
      values,
    );
  }

  /**
   * Creates a mutable internal snapshot.
   *
   * This is intentionally not exposed publicly as a Map.
   *
   * It is useful for framework infrastructure that needs to
   * derive another ContextValues instance.
   */
  public toStore(): ContextValueStore {
    return new Map(
      this.values,
    );
  }

  /**
   * Iterates over stored context values.
   *
   * Keys are exposed as symbols because the ContextKey
   * objects themselves are intentionally not recoverable
   * from the internal store.
   */
  public *entries(): IterableIterator<
    readonly [symbol, unknown]
  > {
    for (
      const entry of this.values.entries()
    ) {
      yield entry;
    }
  }
}

/**
 * Creates an empty ContextValues collection.
 */
export function createContextValues(): ContextValues {
  return new ContextValues();
}