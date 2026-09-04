import type { Container } from "./container.js";

/**
 * Creates a dependency using the Zudojs dependency container.
 */
export interface FactoryProvider<T> {
  readonly useFactory: (container: Container) => T;
}

/**
 * Provides an already-created value.
 */
export interface ValueProvider<T> {
  readonly useValue: T;
}

/**
 * Creates a dependency from a class constructor.
 */
export interface ClassProvider<T> {
  readonly useClass: Constructor<T>;
}

/**
 * Supported constructor type.
 */
export type Constructor<T> = new (...args: never[]) => T;

/**
 * A dependency provider understood by the Zudojs container.
 */
export type Provider<T> =
  ClassProvider<T> | FactoryProvider<T> | ValueProvider<T>;
