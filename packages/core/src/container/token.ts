/**
 * A unique identifier used to register and resolve dependencies.
 *
 * Lattice supports classes, strings, and symbols as dependency tokens.
 */
export type Token<T = unknown> =
  | ConstructorToken<T>
  | string
  | symbol;

/**
 * A class that can be used as a dependency token.
 */
export type ConstructorToken<T> = new (...args: unknown[]) => T;

/**
 * Creates a unique symbol token.
 *
 * Useful for interfaces and infrastructure contracts that do not
 * exist at runtime.
 */
export function createToken<T = unknown>(description: string): Token<T> {
  return Symbol(description);
}