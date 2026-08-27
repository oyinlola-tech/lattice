/**
 * Dependency injection provider definitions for Lattice.
 *
 * Providers describe how a dependency should be created or
 * retrieved. They do not perform resolution themselves.
 */

import type {
  Constructor,
  InjectionToken,
  Token,
} from "../containerToken/containerToken.type.js";

/**
 * Normalized token accepted by the container.
 */
export type ProviderToken<T = unknown> =
  | Token<T>
  | InjectionToken<T>;

/**
 * Creates an instance using a class constructor.
 *
 * The container is responsible for resolving the constructor
 * dependencies.
 */
export interface ClassProvider<T> {
  readonly useClass:
    Constructor<T>;
}

/**
 * Creates an instance using a factory function.
 *
 * Dependencies listed in `inject` are resolved by the container
 * and passed to the factory in the same order.
 */
export interface FactoryProvider<T> {
  readonly useFactory:
    (...dependencies: unknown[]) => T;

  readonly inject?:
    readonly ProviderToken[];
}

/**
 * Provides an already-created value.
 *
 * The same value is returned whenever the provider is resolved.
 */
export interface ValueProvider<T> {
  readonly useValue:
    T;
}

/**
 * Resolves the dependency from another registered token.
 *
 * Example:
 *
 * LOGGER -> CONSOLE_LOGGER
 */
export interface ExistingProvider<T> {
  readonly useExisting:
    ProviderToken<T>;
}

/**
 * A provider describing how a dependency should be created.
 */
export type Provider<T = unknown> =
  | ClassProvider<T>
  | FactoryProvider<T>
  | ValueProvider<T>
  | ExistingProvider<T>;

/**
 * A provider combined with its registration token.
 */
export interface TokenProvider<T = unknown> {
  readonly provide:
    ProviderToken<T>;

  readonly provider:
    Provider<T>;
}

/**
 * A class-based registration.
 */
export interface ClassRegistration<T = unknown> {
  readonly provide:
    ProviderToken<T>;

  readonly useClass:
    Constructor<T>;
}

/**
 * A factory-based registration.
 */
export interface FactoryRegistration<T = unknown> {
  readonly provide:
    ProviderToken<T>;

  readonly useFactory:
    (...dependencies: unknown[]) => T;

  readonly inject?:
    readonly ProviderToken[];
}

/**
 * A value-based registration.
 */
export interface ValueRegistration<T = unknown> {
  readonly provide:
    ProviderToken<T>;

  readonly useValue:
    T;
}

/**
 * An alias-based registration.
 */
export interface ExistingRegistration<T = unknown> {
  readonly provide:
    ProviderToken<T>;

  readonly useExisting:
    ProviderToken<T>;
}

/**
 * Anything that can be passed to the container registration API.
 */
export type ContainerProvider<T = unknown> =
  | Provider<T>
  | TokenProvider<T>
  | ClassRegistration<T>
  | FactoryRegistration<T>
  | ValueRegistration<T>
  | ExistingRegistration<T>;

/**
 * Determines whether a provider is a class provider.
 */
export function isClassProvider<T = unknown>(
  provider:
    Provider<T>,
):
  provider is ClassProvider<T> {
  return (
    "useClass" in provider &&
    typeof provider.useClass ===
      "function"
  );
}

/**
 * Determines whether a provider is a factory provider.
 */
export function isFactoryProvider<T = unknown>(
  provider:
    Provider<T>,
):
  provider is FactoryProvider<T> {
  return (
    "useFactory" in provider &&
    typeof provider.useFactory ===
      "function"
  );
}

/**
 * Determines whether a provider is a value provider.
 */
export function isValueProvider<T = unknown>(
  provider:
    Provider<T>,
):
  provider is ValueProvider<T> {
  return (
    "useValue" in provider
  );
}

/**
 * Determines whether a provider is an existing provider.
 */
export function isExistingProvider<T = unknown>(
  provider:
    Provider<T>,
):
  provider is ExistingProvider<T> {
  return (
    "useExisting" in provider
  );
}

/**
 * Determines whether a value is a complete token registration.
 */
export function isTokenProvider<T = unknown>(
  provider:
    ContainerProvider<T>,
):
  provider is TokenProvider<T> {
  return (
    "provide" in provider &&
    "provider" in provider
  );
}

/**
 * Determines whether a provider has explicit dependency tokens.
 */
export function hasInjectedDependencies<T = unknown>(
  provider:
    Provider<T>,
):
  provider is FactoryProvider<T> {
  return (
    isFactoryProvider(provider) &&
    Array.isArray(provider.inject)
  );
}

/**
 * Creates a class provider.
 */
export function classProvider<T>(
  useClass:
    Constructor<T>,
):
  ClassProvider<T> {
  return Object.freeze({
    useClass,
  });
}

/**
 * Creates a factory provider.
 */
export function factoryProvider<T>(
  useFactory:
    (...dependencies: unknown[]) => T,
  inject:
    readonly ProviderToken[] = [],
):
  FactoryProvider<T> {
  return Object.freeze({
    useFactory,

    inject:
      Object.freeze([
        ...inject,
      ]),
  });
}

/**
 * Creates a value provider.
 */
export function valueProvider<T>(
  useValue:
    T,
):
  ValueProvider<T> {
  return Object.freeze({
    useValue,
  });
}

/**
 * Creates an existing provider.
 */
export function existingProvider<T>(
  useExisting:
    ProviderToken<T>,
):
  ExistingProvider<T> {
  return Object.freeze({
    useExisting,
  });
}

/**
 * Creates a token registration.
 */
export function provideClass<T>(
  provide:
    ProviderToken<T>,
  useClass:
    Constructor<T>,
):
  ClassRegistration<T> {
  return Object.freeze({
    provide,
    useClass,
  });
}

/**
 * Creates a factory registration.
 */
export function provideFactory<T>(
  provide:
    ProviderToken<T>,
  useFactory:
    (...dependencies: unknown[]) => T,
  inject:
    readonly ProviderToken[] = [],
):
  FactoryRegistration<T> {
  return Object.freeze({
    provide,

    useFactory,

    inject:
      Object.freeze([
        ...inject,
      ]),
  });
}

/**
 * Creates a value registration.
 */
export function provideValue<T>(
  provide:
    ProviderToken<T>,
  useValue:
    T,
):
  ValueRegistration<T> {
  return Object.freeze({
    provide,
    useValue,
  });
}

/**
 * Creates an alias registration.
 */
export function provideExisting<T>(
  provide:
    ProviderToken<T>,
  useExisting:
    ProviderToken<T>,
):
  ExistingRegistration<T> {
  return Object.freeze({
    provide,

    useExisting,
  });
}

/**
 * Extracts the registration token from a provider.
 */
export function getProviderToken<T>(
  provider:
    ContainerProvider<T>,
):
  ProviderToken<T> |
  undefined {
  if (
    isTokenProvider(provider)
  ) {
    return provider.provide;
  }

  return undefined;
}

/**
 * Normalizes a provider into a provider definition.
 *
 * This allows the container registry to work with a single
 * internal representation regardless of the registration syntax
 * supplied by the application.
 */
export function normalizeProvider<T>(
  provider:
    ContainerProvider<T>,
):
  Provider<T> {
  if (
    isTokenProvider(provider)
  ) {
    return provider.provider;
  }

  return provider;
}