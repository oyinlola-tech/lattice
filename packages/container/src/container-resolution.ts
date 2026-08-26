/**
 * Dependency resolution engine for Lattice.
 *
 * Responsible for:
 *
 * 1. Resolving registered tokens
 * 2. Creating class instances
 * 3. Executing factory providers
 * 4. Resolving aliases
 * 5. Applying singleton/scoped/transient lifetimes
 * 6. Detecting circular dependencies
 *
 * Registration storage remains the responsibility of
 * ContainerRegistry.
 */

import type {
  ContainerProvider,
  ProviderToken,
} from "./container-provider.js";

import {
  isClassProvider,
  isExistingProvider,
  isFactoryProvider,
  isValueProvider,
  normalizeProvider,
} from "./container-provider.js";

import type {
  ContainerScope,
} from "./container-scope.js";

import {
  ContainerScope as Scope,
} from "./container-scope.js";

import type {
  ContainerRegistration,
  RegistrationToken,
} from "./container-registration.js";

import {
  getRegistrationToken,
} from "./container-registration.js";

import type {
  ContainerRegistry,
} from "./container-registry.js";

import {
  RegistrationNotFoundError,
} from "./container-registry.js";

import {
  describeToken,
  unwrapToken,
} from "./container-token.js";

import type {
  Token,
} from "./container-token.js";

/**
 * A cache containing resolved dependency instances.
 */
export type ResolutionCache =
  Map<
    Token<unknown>,
    unknown
  >;

/**
 * Dependency resolution path.
 *
 * Used for diagnostics and circular dependency detection.
 */
export type ResolutionPath =
  readonly Token<unknown>[];

/**
 * Options controlling dependency resolution.
 */
export interface ResolutionOptions {
  /**
   * Existing cache for the current resolution scope.
   */
  readonly cache?:
    ResolutionCache;

  /**
   * Current dependency resolution path.
   *
   * Normally managed internally.
   */
  readonly path?:
    ResolutionPath;

  /**
   * Whether to allow resolving unregistered classes
   * directly from their constructors.
   *
   * Defaults to true.
   */
  readonly autoRegisterClasses?:
    boolean;
}

/**
 * Resolution result containing the resolved value and
 * diagnostic information.
 */
export interface ResolutionResult<T> {
  readonly value:
    T;

  readonly token:
    Token<T>;

  readonly registration:
    ContainerRegistration<T>;

  readonly scope:
    ContainerScope;

  readonly fromCache:
    boolean;

  readonly path:
    ResolutionPath;
}

/**
 * Error thrown when circular dependency resolution is detected.
 */
export class CircularDependencyError
  extends Error {
  readonly code =
    "CONTAINER_CIRCULAR_DEPENDENCY";

  readonly path:
    ResolutionPath;

  constructor(
    path:
      ResolutionPath,
  ) {
    const formatted =
      path
        .map(
          (token) =>
            describeToken(token),
        )
        .join(" -> ");

    super(
      `Circular dependency detected: ${formatted}.`,
    );

    this.name =
      "CircularDependencyError";

    this.path =
      path;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

/**
 * Error thrown when a provider cannot be resolved.
 */
export class ProviderResolutionError
  extends Error {
  readonly code =
    "CONTAINER_PROVIDER_RESOLUTION_FAILED";

  readonly token:
    Token<unknown>;

  public override readonly name: string = "ProviderResolutionError";

  constructor(
    token:
      Token<unknown>,
    cause:
      unknown,
  ) {
    const message =
      cause instanceof Error
        ? cause.message
        : String(cause);

    super(
      `Failed to resolve provider for ${describeToken(token)}: ${message}`,
      { cause },
    );

    this.token =
      token;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

/**
 * Dependency resolver.
 */
export class ContainerResolver {
  private readonly registry:
    ContainerRegistry;

  private readonly singletonCache:
    ResolutionCache;

  constructor(
    registry:
      ContainerRegistry,
  ) {
    this.registry =
      registry;

    this.singletonCache =
      new Map();
  }

  /**
   * Resolves a dependency.
   */
  resolve<T>(
    token:
      RegistrationToken<T>,
    options:
      ResolutionOptions = {},
  ):
    T {
    return this.resolveDetailed(
      token,
      options,
    ).value;
  }

  /**
   * Resolves a dependency and returns diagnostic information.
   */
  resolveDetailed<T>(
    token:
      RegistrationToken<T>,
    options:
      ResolutionOptions = {},
  ):
    ResolutionResult<T> {
    const normalizedToken =
      unwrapToken(token);

    const cache =
      options.cache ??
      this.singletonCache;

    const path =
      options.path ??
      [];

    return this.resolveInternal(
      normalizedToken,
      cache,
      path,
      options,
    );
  }

  /**
   * Resolves a dependency internally.
   */
  private resolveInternal<T>(
    token:
      Token<T>,
    cache:
      ResolutionCache,
    path:
      ResolutionPath,
    options:
      ResolutionOptions,
  ):
    ResolutionResult<T> {
    if (
      path.includes(
        token,
      )
    ) {
      throw new CircularDependencyError([
        ...path,
        token,
      ]);
    }

    const registration =
      this.registry.get(
        token,
      );

    if (
      !registration
    ) {
      if (
        options.autoRegisterClasses !==
          false &&
        typeof token ===
          "function"
      ) {
        const autoRegistration =
          this.registry.register(
            token,
            {
              useClass:
                token,
            },
            {
              scope:
                Scope.TRANSIENT,
            },
          );

        return this.resolveInternal(
          token,
          cache,
          path,
          {
            ...options,
            autoRegisterClasses:
              false,
          },
        );
      }

      throw new RegistrationNotFoundError(
        token,
      );
    }

    const currentPath:
      ResolutionPath = [
        ...path,
        token,
      ];

    if (
      registration.scope !==
        Scope.TRANSIENT
    ) {
      const cached =
        cache.get(
          token,
        );

      if (
        cached !==
        undefined
      ) {
        return {
          value:
            cached as T,

          token,

          registration,

          scope:
            registration.scope,

          fromCache:
            true,

          path:
            currentPath,
        };
      }
    }

    const value =
      this.createInstance(
        registration,
        cache,
        currentPath,
        options,
      );

    if (
      registration.scope ===
        Scope.SINGLETON
    ) {
      this.singletonCache.set(
        token,
        value,
      );
    } else if (
      registration.scope ===
        Scope.SCOPED
    ) {
      cache.set(
        token,
        value,
      );
    }

    return {
      value,

      token,

      registration,

      scope:
        registration.scope,

      fromCache:
        false,

      path:
        currentPath,
    };
  }

  /**
   * Creates an instance from a registration.
   */
  private createInstance<T>(
    registration:
      ContainerRegistration<T>,
    cache:
      ResolutionCache,
    path:
      ResolutionPath,
    options:
      ResolutionOptions,
  ):
    T {
    const provider =
      normalizeProvider(
        registration.provider,
      );

    try {
      if (
        isValueProvider(
          provider,
        )
      ) {
        return provider.useValue;
      }

      if (
        isExistingProvider(
          provider,
        )
      ) {
        return this.resolve(
          provider.useExisting,
          {
            ...options,
            cache,
            path,
          },
        );
      }

      if (
        isFactoryProvider(
          provider,
        )
      ) {
        return this.createFromFactory(
          provider,
          cache,
          path,
          options,
        );
      }

      if (
        isClassProvider(
          provider,
        )
      ) {
        return this.createFromClass(
          provider.useClass,
          cache,
          path,
          options,
        );
      }

      throw new Error(
        "Unsupported container provider.",
      );
    } catch (
      error
    ) {
      if (
        error instanceof
        CircularDependencyError
      ) {
        throw error;
      }

      if (
        error instanceof
        ProviderResolutionError
      ) {
        throw error;
      }

      throw new ProviderResolutionError(
        getRegistrationToken(
          registration,
        ),
        error,
      );
    }
  }

  /**
   * Creates an instance from a factory provider.
   */
  private createFromFactory<T>(
    provider:
      Extract<
        ContainerProvider<T>,
        {
          useFactory:
            (...args: any[]) => T;
        }
      >,
    cache:
      ResolutionCache,
    path:
      ResolutionPath,
    options:
      ResolutionOptions,
  ):
    T {
    const dependencies =
      provider.inject ??
      [];

    const resolvedDependencies =
      dependencies.map(
        (
          dependency,
        ) =>
          this.resolve(
            dependency,
            {
              ...options,
              cache,
              path,
            },
          ),
      );

    return provider.useFactory(
      ...resolvedDependencies,
    );
  }

  /**
   * Creates an instance from a class constructor.
   *
   * Constructor dependency metadata is intentionally not
   * inferred here. Dependencies can be supplied through
   * explicit provider metadata until a reflection/decorator
   * layer is introduced.
   */
  private createFromClass<T>(
    constructor:
      new (...args: any[]) => T,
    _cache:
      ResolutionCache,
    _path:
      ResolutionPath,
    _options:
      ResolutionOptions,
  ):
    T {
    return new constructor();
  }

  /**
   * Creates a child resolution cache.
   *
   * Singleton instances remain globally shared through the
   * resolver's singleton cache, while scoped instances live
   * inside the supplied cache.
   */
  createScope():
    ResolutionCache {
    return new Map();
  }

  /**
   * Clears all singleton instances.
   *
   * This does not remove registrations.
   */
  clearSingletons():
    void {
    this.singletonCache.clear();
  }

  /**
   * Checks whether a singleton instance is currently cached.
   */
  hasSingleton<T>(
    token:
      RegistrationToken<T>,
  ):
    boolean {
    return this.singletonCache.has(
      unwrapToken(token),
    );
  }

  /**
   * Returns the currently cached singleton.
   */
  getSingleton<T>(
    token:
      RegistrationToken<T>,
  ):
    T |
    undefined {
    return this.singletonCache.get(
      unwrapToken(token),
    ) as T |
      undefined;
  }

  /**
   * Removes a singleton instance from the cache.
   */
  removeSingleton<T>(
    token:
      RegistrationToken<T>,
  ):
    boolean {
    return this.singletonCache.delete(
      unwrapToken(token),
    );
  }

  /**
   * Clears a specific scoped cache.
   */
  clearScope(
    cache:
      ResolutionCache,
  ):
    void {
    cache.clear();
  }

  /**
   * Resolves all registrations associated with tokens.
   */
  resolveMany<T>(
    tokens:
      readonly RegistrationToken<T>[],
    options:
      ResolutionOptions = {},
  ):
    T[] {
    return tokens.map(
      (
        token,
      ) =>
        this.resolve(
          token,
          options,
        ),
    );
  }

  /**
   * Determines whether a token can currently be resolved.
   */
  canResolve<T>(
    token:
      RegistrationToken<T>,
  ):
    boolean {
    const normalizedToken =
      unwrapToken(token);

    if (
      this.registry.has(
        normalizedToken,
      )
    ) {
      return true;
    }

    return (
      typeof normalizedToken ===
      "function"
    );
  }
}

/**
 * Creates a container resolver.
 */
export function createContainerResolver(
  registry:
    ContainerRegistry,
):
  ContainerResolver {
  return new ContainerResolver(
    registry,
  );
}