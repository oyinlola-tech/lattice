/**
 * A constructor that can be used as a dependency token.
 *
 * Example:
 *
 * class UserService {}
 *
 * container.register(UserService, {
 *   useClass: UserService,
 * });
 */
export interface Constructor<T = unknown> {
  new (...args: any[]): T;
}

/**
 * A unique symbol token.
 *
 * Symbols are useful for dependencies that do not have a
 * concrete class representation.
 *
 * Example:
 *
 * export const DATABASE =
 *   Symbol.for("lattice:database");
 */
export type TokenSymbol =
  symbol;

/**
 * A string token.
 *
 * Useful when a dependency needs a human-readable identifier.
 */
export type TokenString =
  string;

/**
 * Every supported dependency token.
 */
export type Token<T = unknown> =
  | Constructor<T>
  | TokenSymbol
  | TokenString;

/**
 * A strongly typed injection token.
 *
 * This is useful when exposing framework-level tokens.
 */
export interface InjectionToken<T = unknown> {
  readonly token:
    Token<T>;

  readonly description?:
    string;
}

/**
 * Creates a typed injection token.
 *
 * Example:
 *
 * export const DATABASE =
 *   createToken<Database>("DATABASE");
 */
export function createToken<T>(
  description:
    string,
): InjectionToken<T> {
  return Object.freeze({
    token:
      Symbol(description),

    description,
  });
}

/**
 * Creates a globally shared symbol token.
 *
 * Symbol.for() ensures that the same key resolves to
 * the same symbol within the JavaScript runtime.
 */
export function createGlobalToken<T>(
  key:
    string,
): InjectionToken<T> {
  return Object.freeze({
    token:
      Symbol.for(key),

    description:
      key,
  });
}

/**
 * Extracts the underlying token from an InjectionToken
 * or returns the token unchanged.
 */
export function unwrapToken<T>(
  token:
    Token<T> |
    InjectionToken<T>,
):
  Token<T> {
  if (
    isInjectionToken<T>(
      token,
    )
  ) {
    return token.token;
  }

  return token;
}

/**
 * Determines whether a value is an InjectionToken.
 */
export function isInjectionToken<T = unknown>(
  value:
    unknown,
):
  value is InjectionToken<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "token" in value &&
    (
      typeof (
        value as {
          token?: unknown;
        }
      ).token === "function" ||
      typeof (
        value as {
          token?: unknown;
        }
      ).token === "string" ||
      typeof (
        value as {
          token?: unknown;
        }
      ).token === "symbol"
    )
  );
}

/**
 * Determines whether a value is a constructor token.
 */
export function isConstructorToken<T = unknown>(
  token:
    Token<T>,
):
  token is Constructor<T> {
  return (
    typeof token ===
    "function"
  );
}

/**
 * Determines whether a value is a symbol token.
 */
export function isSymbolToken<T = unknown>(
  token:
    Token<T>,
):
  token is symbol {
  return (
    typeof token ===
    "symbol"
  );
}

/**
 * Determines whether a value is a string token.
 */
export function isStringToken<T = unknown>(
  token:
    Token<T>,
):
  token is string {
  return (
    typeof token ===
    "string"
  );
}

/**
 * Produces a readable representation of a token.
 *
 * This is primarily used for diagnostics and container
 * resolution errors.
 */
export function describeToken<T>(
  token:
    Token<T> |
    InjectionToken<T>,
):
  string {
  const resolved =
    unwrapToken(token);

  if (
    typeof resolved ===
    "string"
  ) {
    return resolved;
  }

  if (
    typeof resolved ===
    "symbol"
  ) {
    return resolved.description
      ? `Symbol(${resolved.description})`
      : "Symbol()";
  }

  if (
    typeof resolved ===
    "function"
  ) {
    return resolved.name ||
      "AnonymousConstructor";
  }

  return "UnknownToken";
}