/**
 * Dependency injection token definitions for Lattice.
 * Tokens identify dependencies within the container.
 */

export interface Constructor<T = unknown> { new (...args: unknown[]): T; }
export type TokenSymbol = symbol;
export type TokenString = string;
export type Token<T = unknown> = Constructor<T> | TokenSymbol | TokenString;

export interface InjectionToken<T = unknown> {
  readonly token: Token<T>;
  readonly description?: string;
}

export function createToken<T>(description: string): InjectionToken<T> {
  return Object.freeze({ token: Symbol(description), description });
}

export function createGlobalToken<T>(key: string): InjectionToken<T> {
  return Object.freeze({ token: Symbol.for(key), description: key });
}

export function unwrapToken<T>(token: Token<T> | InjectionToken<T>): Token<T> {
  if (isInjectionToken<T>(token)) return token.token;
  return token;
}

export function isInjectionToken<T = unknown>(value: unknown): value is InjectionToken<T> {
  return (
    typeof value === "object" && value !== null && "token" in value &&
    (typeof (value as { token?: unknown }).token === "function" ||
     typeof (value as { token?: unknown }).token === "string" ||
     typeof (value as { token?: unknown }).token === "symbol")
  );
}

export function isConstructorToken<T = unknown>(token: Token<T>): token is Constructor<T> { return typeof token === "function"; }
export function isSymbolToken<T = unknown>(token: Token<T>): token is symbol { return typeof token === "symbol"; }
export function isStringToken<T = unknown>(token: Token<T>): token is string { return typeof token === "string"; }

export function describeToken<T>(token: Token<T> | InjectionToken<T>): string {
  const resolved = unwrapToken(token);
  if (typeof resolved === "string") return resolved;
  if (typeof resolved === "symbol") return resolved.description ? `Symbol(${resolved.description})` : "Symbol()";
  if (typeof resolved === "function") return resolved.name || "AnonymousConstructor";
  return "UnknownToken";
}
