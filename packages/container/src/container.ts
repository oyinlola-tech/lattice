import type {
  ContainerProvider,
  ProviderToken,
} from "./container-provider.js";

import {
  existingProvider,
  factoryProvider,
  valueProvider,
  classProvider,
} from "./container-provider.js";

import type {
  ContainerScope,
} from "./container-scope.js";

import {
  ContainerScope as Scope,
} from "./container-scope.js";

import type {
  ContainerRegistration,
  CreateRegistrationOptions,
  RegistrationToken,
} from "./container-registration.js";

import {
  getRegistrationToken,
} from "./container-registration.js";

import {
  ContainerRegistry,
} from "./container-registry.js";

import {
  ContainerResolver,
} from "./container-resolution.js";

import type {
  ResolutionCache,
} from "./container-resolution.js";

import {
  ContainerLifecycle,
  ContainerLifecycleOwner,
} from "./container-lifecycle.js";

import type {
  ContainerOptions,
  ResolvedContainerOptions,
} from "./container-options.js";

import {
  resolveContainerOptions,
} from "./container-options.js";

import type {
  Token,
} from "./container-token.js";

import {
  unwrapToken,
} from "./container-token.js";

/**
 * Options used when creating a child container scope.
 */
export interface ContainerScopeOptions {
  /**
   * Optional name for the child scope.
   */
  readonly name?:
    string;

  /**
   * Optional metadata for the scope.
   */
  readonly metadata?:
    Readonly<
      Record<string, unknown>
    >;
}

/**
 * Represents a child dependency scope.
 *
 * A scope has its own scoped-instance cache while sharing
 * registrations and singleton instances with its parent.
 */
export class ContainerScopeContext {
  private disposed =
    false;

  private readonly cache:
    ResolutionCache;

  private readonly lifecycle:
    ContainerLifecycle;

  readonly name:
    string;

  readonly metadata:
    Readonly<
      Record<string, unknown>
    >;

  constructor(
    private readonly parent:
      Container,
    options:
      ContainerScopeOptions = {},
  ) {
    this.name =
      options.name ??
      `${parent.name}:scope`;

    this.metadata =
      Object.freeze({
        ...(options.metadata ?? {}),
      });

    this.cache =
      parent.resolver.createScope();

    this.lifecycle =
      new ContainerLifecycle();
  }

  /**
   * Resolves a dependency within this scope.
   */
  resolve<T>(
    token:
      RegistrationToken<T>,
  ):
    T {
    this.ensureActive();

    const result =
      this.parent.resolver.resolveDetailed(
        token,
        {
          ...this.parent.resolutionOptions,
          cache:
            this.cache,
        },
      );

    this.lifecycle.track(
      result.token,
      result.value,
      ContainerLifecycleOwner.SCOPE,
    );

    return result.value;
  }

  /**
   * Resolves multiple dependencies within this scope.
   */
  resolveMany<T>(
    tokens:
      readonly RegistrationToken<T>[],
  ):
    T[] {
    return tokens.map(
      (token) =>
        this.resolve(
          token,
        ),
    );
  }

  /**
   * Checks whether a dependency can be resolved.
   */
  canResolve<T>(
    token:
      RegistrationToken<T>,
  ):
    boolean {
    this.ensureActive();

    return this.parent.resolver.canResolve(
      token,
    );
  }

  /**
   * Checks whether a registration exists.
   */
  has<T>(
    token:
      RegistrationToken<T>,
  ):
    boolean {
    this.ensureActive();

    return this.parent.has(
      token,
    );
  }

  /**
   * Creates another nested scope.
   */
  createScope(
    options:
      ContainerScopeOptions = {},
  ):
    ContainerScopeContext {
    this.ensureActive();

    return this.parent.createScope(
      options,
    );
  }

  /**
   * Disposes all instances belonging to this scope.
   */
  async dispose():
    Promise<void> {
    if (
      this.disposed
    ) {
      return;
    }

    try {
      await this.lifecycle.disposeScope();
    } finally {
      this.cache.clear();
      this.disposed =
        true;
    }
  }

  /**
   * Returns whether the scope has been disposed.
   */
  isDisposed():
    boolean {
    return this.disposed;
  }

  /**
   * Returns the parent container.
   */
  getParent():
    Container {
    return this.parent;
  }

  /**
   * Throws when the scope is no longer active.
   */
  private ensureActive():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        `Container scope "${this.name}" has already been disposed.`,
      );
    }
  }
}

/**
 * Main Lattice dependency injection container.
 */
export class Container {
  readonly name:
    string;

  readonly options:
    ResolvedContainerOptions;

  readonly registry:
    ContainerRegistry;

  readonly resolver:
    ContainerResolver;

  readonly lifecycle:
    ContainerLifecycle;

  private started =
    false;

  private disposed =
    false;

  constructor(
    options:
      ContainerOptions = {},
  ) {
    this.options =
      resolveContainerOptions(
        options,
      );

    this.name =
      this.options.name;

    this.registry =
      new ContainerRegistry(
        this.options.registry,
      );

    this.resolver =
      new ContainerResolver(
        this.registry,
      );

    this.lifecycle =
      new ContainerLifecycle(
        this.options.lifecycle,
      );
  }

  /**
   * Starts the container.
   *
   * Starting is idempotent.
   */
  start():
    this {
    this.ensureNotDisposed();

    if (
      this.started
    ) {
      return this;
    }

    this.started =
      true;

    return this;
  }

  /**
   * Registers a provider.
   */
  register<T>(
    token:
      RegistrationToken<T>,
    provider:
      ContainerProvider<T>,
    options:
      CreateRegistrationOptions = {},
  ):
    ContainerRegistration<T> {
    this.ensureMutable();

    return this.registry.register(
      token,
      provider,
      options,
    );
  }

  /**
   * Registers a class.
   */
  registerClass<T>(
    token:
      RegistrationToken<T>,
    constructor:
      new (...args: any[]) => T,
    options:
      CreateRegistrationOptions = {},
  ):
    ContainerRegistration<T> {
    return this.register(
      token,
      classProvider(
        constructor,
      ),
      options,
    );
  }

  /**
   * Registers a value.
   */
  registerValue<T>(
    token:
      RegistrationToken<T>,
    value:
      T,
    options:
      CreateRegistrationOptions = {},
  ):
    ContainerRegistration<T> {
    return this.register(
      token,
      valueProvider(
        value,
      ),
      {
        ...options,
        scope:
          Scope.SINGLETON,
      },
    );
  }

  /**
   * Registers a factory.
   */
  registerFactory<T>(
    token:
      RegistrationToken<T>,
    factory:
      (...dependencies: any[]) => T,
    inject:
      readonly ProviderToken[] = [],
    options:
      CreateRegistrationOptions = {},
  ):
    ContainerRegistration<T> {
    return this.register(
      token,
      factoryProvider(
        factory,
        inject,
      ),
      options,
    );
  }

  /**
   * Registers an alias to another token.
   */
  registerExisting<T>(
    token:
      RegistrationToken<T>,
    existing:
      ProviderToken<T>,
    options:
      CreateRegistrationOptions = {},
  ):
    ContainerRegistration<T> {
    return this.register(
      token,
      existingProvider(
        existing,
      ),
      options,
    );
  }

  /**
   * Resolves a dependency.
   */
  resolve<T>(
    token:
      RegistrationToken<T>,
  ):
    T {
    this.ensureActive();

    const result =
      this.resolver.resolveDetailed(
        token,
        this.resolutionOptions,
      );

    this.lifecycle.track(
      result.token,
      result.value,
      ContainerLifecycleOwner.CONTAINER,
    );

    return result.value;
  }

  /**
   * Resolves multiple dependencies.
   */
  resolveMany<T>(
    tokens:
      readonly RegistrationToken<T>[],
  ):
    T[] {
    return tokens.map(
      (token) =>
        this.resolve(
          token,
        ),
    );
  }

  /**
   * Resolves a dependency if available.
   *
   * Returns undefined instead of throwing when the dependency
   * is not registered and cannot be automatically resolved.
   */
  resolveOptional<T>(
    token:
      RegistrationToken<T>,
  ):
    T |
    undefined {
    if (
      !this.canResolve(
        token,
      )
    ) {
      return undefined;
    }

    return this.resolve(
      token,
    );
  }

  /**
   * Checks whether a dependency can be resolved.
   */
  canResolve<T>(
    token:
      RegistrationToken<T>,
  ):
    boolean {
    this.ensureNotDisposed();

    return this.resolver.canResolve(
      token,
    );
  }

  /**
   * Checks whether a token has a registration.
   */
  has<T>(
    token:
      RegistrationToken<T>,
  ):
    boolean {
    this.ensureNotDisposed();

    return this.registry.has(
      token,
    );
  }

  /**
   * Gets a registration.
   */
  getRegistration<T>(
    token:
      RegistrationToken<T>,
  ):
    ContainerRegistration<T> |
    undefined {
    this.ensureNotDisposed();

    return this.registry.get(
      token,
    );
  }

  /**
   * Removes a registration.
   */
  remove<T>(
    token:
      RegistrationToken<T>,
  ):
    boolean {
    this.ensureMutable();

    return this.registry.remove(
      token,
    );
  }

  /**
   * Creates a child resolution scope.
   */
  createScope(
    options:
      ContainerScopeOptions = {},
  ):
    ContainerScopeContext {
    this.ensureActive();

    if (
      !this.options.allowScopes
    ) {
      throw new Error(
        "Container scopes are disabled.",
      );
    }

    return new ContainerScopeContext(
      this,
      options,
    );
  }

  /**
   * Returns all current registrations.
   */
  getRegistrations():
    readonly ContainerRegistration[] {
    this.ensureNotDisposed();

    return this.registry.getAll();
  }

  /**
   * Returns the number of registrations.
   */
  get registrationCount():
    number {
    return this.registry.size;
  }

  /**
   * Returns whether the container has started.
   */
  isStarted():
    boolean {
    return this.started;
  }

  /**
   * Returns whether the container has been disposed.
   */
  isDisposed():
    boolean {
    return this.disposed;
  }

  /**
   * Clears singleton instances.
   *
   * Registrations themselves remain intact.
   */
  clearSingletons():
    void {
    this.ensureActive();

    this.resolver.clearSingletons();
  }

  /**
   * Disposes the container and all owned instances.
   */
  async dispose():
    Promise<void> {
    if (
      this.disposed
    ) {
      return;
    }

    try {
      if (
        this.options.autoDispose
      ) {
        await this.lifecycle.disposeContainer();
      } else {
        this.lifecycle.reset();
      }
    } finally {
      this.resolver.clearSingletons();

      this.disposed =
        true;

      this.started =
        false;
    }
  }

  /**
   * Gets the resolution options passed to the resolver.
   */
  get resolutionOptions():
    {
      autoRegisterClasses:
        boolean;

      detectCircularDependencies:
        boolean;

      maxResolutionDepth:
        number;
    } {
    return {
      autoRegisterClasses:
        this.options.resolution
          .autoRegisterClasses ??
        true,

      detectCircularDependencies:
        this.options.resolution
          .detectCircularDependencies ??
        true,

      maxResolutionDepth:
        this.options.resolution
          .maxResolutionDepth ??
        100,
    };
  }

  /**
   * Ensures the container is active.
   */
  private ensureActive():
    void {
    this.ensureNotDisposed();

    if (
      !this.started
    ) {
      this.start();
    }
  }

  /**
   * Ensures the container hasn't been disposed.
   */
  private ensureNotDisposed():
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        `Container "${this.name}" has already been disposed.`,
      );
    }
  }

  /**
   * Ensures registration changes are allowed.
   */
  private ensureMutable():
    void {
    this.ensureNotDisposed();

    if (
      !this.options.freezeRegistrations
    ) {
      return;
    }

    if (
      this.started
    ) {
      throw new Error(
        `Registrations for container "${this.name}" are frozen.`,
      );
    }
  }
}

/**
 * Creates a new Lattice container.
 */
export function createContainer(
  options:
    ContainerOptions = {},
):
  Container {
  return new Container(
    options,
  );
}

/**
 * Creates a container and starts it immediately.
 */
export function createStartedContainer(
  options:
    ContainerOptions = {},
):
  Container {
  return new Container(
    options,
  ).start();
}