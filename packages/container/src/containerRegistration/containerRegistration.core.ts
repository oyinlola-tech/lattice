/**
 * Dependency registration definitions for Lattice.
 *
 * A registration is the container's normalized description of
 * a dependency. It combines:
 *
 * 1. The token used to resolve the dependency
 * 2. The provider responsible for creating it
 * 3. The lifetime/scope of the instance
 * 4. Optional metadata
 */

import {
  ContainerScope,
  DEFAULT_CONTAINER_SCOPE,
  resolveContainerScope,
} from "../containerScope/containerScope.type.js";

import type {
  ContainerProvider,
  ProviderToken,
} from "../containerProvider/containerProvider.core.js";

import {
  getProviderToken,
  normalizeProvider,
} from "../containerProvider/containerProvider.core.js";

import type {
  Constructor,
  InjectionToken,
  Token,
} from "../containerToken/containerToken.type.js";

import {
  describeToken,
  unwrapToken,
} from "../containerToken/containerToken.type.js";

/**
 * Token accepted by a registration.
 */
export type RegistrationToken<T = unknown> =
  | Token<T>
  | InjectionToken<T>;

/**
 * Optional metadata attached to a registration.
 */
export interface RegistrationMetadata {
  /**
   * Human-readable registration name.
   */
  readonly name?:
    string;

  /**
   * Description of the registered dependency.
   */
  readonly description?:
    string;

  /**
   * Optional module that owns the registration.
   */
  readonly module?:
    string;

  /**
   * Whether the registration is exported by its module.
   */
  readonly exported?:
    boolean;

  /**
   * Arbitrary application/framework metadata.
   */
  readonly metadata?:
    Readonly<
      Record<string, unknown>
    >;
}

/**
 * Complete registration definition.
 */
export interface ContainerRegistration<T = unknown> {
  /**
   * Dependency token.
   */
  readonly token:
    RegistrationToken<T>;

  /**
   * Provider used to obtain the dependency.
   */
  readonly provider:
    ContainerProvider<T>;

  /**
   * Dependency lifetime.
   */
  readonly scope:
    ContainerScope;

  /**
   * Optional registration metadata.
   */
  readonly metadata:
    RegistrationMetadata;

  /**
   * Whether this registration has already been instantiated.
   *
   * This is primarily useful for singleton/scoped registrations.
   */
  readonly initialized:
    boolean;

  /**
   * Registration creation timestamp.
   */
  readonly createdAt:
    Date;
}

/**
 * Options for creating a registration.
 */
export interface CreateRegistrationOptions
  extends RegistrationMetadata {
  /**
   * Dependency lifetime.
   */
  readonly scope?:
    ContainerScope;
}

/**
 * Internal mutable registration state.
 *
 * The public ContainerRegistration remains immutable.
 */
export interface MutableRegistrationState<T = unknown> {
  readonly token:
    RegistrationToken<T>;

  readonly provider:
    ContainerProvider<T>;

  scope:
    ContainerScope;

  metadata:
    RegistrationMetadata;

  initialized:
    boolean;

  createdAt:
    Date;
}

/**
 * Creates a normalized container registration.
 */
export function createRegistration<T>(
  token:
    RegistrationToken<T>,
  provider:
    ContainerProvider<T>,
  options:
    CreateRegistrationOptions = {},
):
  ContainerRegistration<T> {
  const normalizedToken =
    unwrapToken(token);

  const normalizedProvider =
    normalizeProvider(
      provider,
    );

  const registration:
    ContainerRegistration<T> =
    {
      token:
        normalizedToken,

      provider:
        normalizedProvider,

      scope:
        resolveContainerScope(
          options.scope,
        ),

      metadata:
        createRegistrationMetadata(
          options,
          normalizedToken,
        ),

      initialized:
        false,

      createdAt:
        new Date(),
    };

  return Object.freeze({
    ...registration,

    metadata:
      Object.freeze({
        ...registration.metadata,

        metadata:
          registration.metadata.metadata
            ? Object.freeze({
                ...registration.metadata.metadata,
              })
            : undefined,
      }),
  });
}

/**
 * Creates metadata for a registration.
 */
function createRegistrationMetadata<T>(
  options:
    CreateRegistrationOptions,
  token:
    Token<T>,
):
  RegistrationMetadata {
  return {
    name:
      options.name ??
      describeToken(token),

    description:
      options.description,

    module:
      options.module,

    exported:
      options.exported,

    metadata:
      options.metadata
        ? Object.freeze({
            ...options.metadata,
          })
        : undefined,
  };
}

/**
 * Creates mutable internal registration state.
 */
export function createMutableRegistrationState<T>(
  registration:
    ContainerRegistration<T>,
):
  MutableRegistrationState<T> {
  return {
    token:
      registration.token,

    provider:
      registration.provider,

    scope:
      registration.scope,

    metadata:
      registration.metadata,

    initialized:
      registration.initialized,

    createdAt:
      registration.createdAt,
  };
}

/**
 * Converts mutable registration state into an immutable
 * public registration.
 */
export function freezeRegistration<T>(
  state:
    MutableRegistrationState<T>,
):
  ContainerRegistration<T> {
  return Object.freeze({
    token:
      state.token,

    provider:
      state.provider,

    scope:
      state.scope,

    metadata:
      Object.freeze({
        ...state.metadata,

        metadata:
          state.metadata.metadata
            ? Object.freeze({
                ...state.metadata.metadata,
              })
            : undefined,
      }),

    initialized:
      state.initialized,

    createdAt:
      state.createdAt,
  });
}

/**
 * Marks a registration as initialized.
 */
export function markRegistrationInitialized<T>(
  registration:
    ContainerRegistration<T>,
):
  ContainerRegistration<T> {
  return Object.freeze({
    ...registration,

    initialized:
      true,
  });
}

/**
 * Returns the normalized token for a registration.
 */
export function getRegistrationToken<T>(
  registration:
    ContainerRegistration<T>,
):
  Token<T> {
  return unwrapToken(
    registration.token,
  );
}

/**
 * Returns the provider token if the registration is itself
 * backed by a token-aware registration.
 */
export function getRegistrationProviderToken<T>(
  registration:
    ContainerRegistration<T>,
):
  ProviderToken<T> |
  undefined {
  return getProviderToken(
    registration.provider,
  );
}

/**
 * Determines whether a registration is singleton.
 */
export function isSingletonRegistration<T>(
  registration:
    ContainerRegistration<T>,
):
  boolean {
  return (
    registration.scope ===
    ContainerScope.SINGLETON
  );
}

/**
 * Determines whether a registration is scoped.
 */
export function isScopedRegistration<T>(
  registration:
    ContainerRegistration<T>,
):
  boolean {
  return (
    registration.scope ===
    ContainerScope.SCOPED
  );
}

/**
 * Determines whether a registration is transient.
 */
export function isTransientRegistration<T>(
  registration:
    ContainerRegistration<T>,
):
  boolean {
  return (
    registration.scope ===
    ContainerScope.TRANSIENT
  );
}

/**
 * Determines whether a registration should be cached.
 */
export function shouldCacheRegistration<T>(
  registration:
    ContainerRegistration<T>,
):
  boolean {
  return (
    registration.scope ===
      ContainerScope.SINGLETON ||
    registration.scope ===
      ContainerScope.SCOPED
  );
}

/**
 * Returns a human-readable registration description.
 */
export function describeRegistration<T>(
  registration:
    ContainerRegistration<T>,
):
  string {
  const name =
    registration.metadata.name ??
    describeToken(
      registration.token,
    );

  return `${name} [${registration.scope}]`;
}

/**
 * Clones a registration with a different scope.
 */
export function withRegistrationScope<T>(
  registration:
    ContainerRegistration<T>,
  scope:
    ContainerScope,
):
  ContainerRegistration<T> {
  return Object.freeze({
    ...registration,

    scope:
      resolveContainerScope(
        scope,
      ),
  });
}

/**
 * Clones a registration with additional metadata.
 */
export function withRegistrationMetadata<T>(
  registration:
    ContainerRegistration<T>,
  metadata:
    RegistrationMetadata,
):
  ContainerRegistration<T> {
  return Object.freeze({
    ...registration,

    metadata:
      Object.freeze({
        ...registration.metadata,

        ...metadata,

        metadata: {
          ...(
            registration.metadata
              .metadata ??
            {}
          ),

          ...(
            metadata.metadata ??
            {}
          ),
        },
      }),
  });
}

/**
 * Ensures a registration has a valid token.
 */
export function assertValidRegistrationToken<T>(
  token:
    RegistrationToken<T>,
):
  void {
  const normalized =
    unwrapToken(token);

  if (
    typeof normalized !==
      "string" &&
    typeof normalized !==
      "symbol" &&
    typeof normalized !==
      "function"
  ) {
    throw new TypeError(
      "Container registration requires a valid token.",
    );
  }
}

/**
 * Ensures a registration has a valid provider.
 */
export function assertValidProvider<T>(
  provider:
    ContainerProvider<T>,
):
  void {
  if (
    provider ===
      null ||
    typeof provider !==
      "object"
  ) {
    throw new TypeError(
      "Container registration requires a valid provider.",
    );
  }
}

/**
 * Creates a registration after validating the token
 * and provider.
 */
export function defineRegistration<T>(
  token:
    RegistrationToken<T>,
  provider:
    ContainerProvider<T>,
  options:
    CreateRegistrationOptions = {},
):
  ContainerRegistration<T> {
  assertValidRegistrationToken(
    token,
  );

  assertValidProvider(
    provider,
  );

  return createRegistration(
    token,
    provider,
    options,
  );
}

/**
 * The default registration scope.
 *
 * Exposed here as a convenience for consumers that build
 * registration definitions themselves.
 */
export const DEFAULT_REGISTRATION_SCOPE:
  ContainerScope =
  DEFAULT_CONTAINER_SCOPE;

/**
 * Registration collection type.
 */
export type RegistrationMap =
  ReadonlyMap<
    Token<unknown>,
    ContainerRegistration<unknown>
  >;

/**
 * Converts registrations into a lookup map.
 */
export function createRegistrationMap(
  registrations:
    readonly ContainerRegistration[],
):
  Map<
    Token<unknown>,
    ContainerRegistration<unknown>
  > {
  const map =
    new Map<
      Token<unknown>,
      ContainerRegistration<unknown>
    >();

  for (
    const registration of registrations
  ) {
    const token =
      getRegistrationToken(
        registration,
      );

    map.set(
      token,
      registration as ContainerRegistration<unknown>,
    );
  }

  return map;
}