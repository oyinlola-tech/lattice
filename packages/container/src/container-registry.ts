/**
 * Dependency registration registry for Lattice.
 *
 * The registry is responsible for storing and looking up
 * dependency registrations.
 *
 * It deliberately does not:
 *
 * 1. Instantiate dependencies
 * 2. Resolve dependency graphs
 * 3. Manage dependency lifetimes
 * 4. Execute lifecycle hooks
 *
 * Those responsibilities belong to the resolution and
 * lifecycle layers.
 */

import type {
  ContainerProvider,
} from "./container-provider.js";

import type {
  ContainerScope,
} from "./container-scope.js";

import type {
  ContainerRegistration,
  CreateRegistrationOptions,
  RegistrationMetadata,
  RegistrationToken,
} from "./container-registration.js";

import {
  defineRegistration,
  getRegistrationToken,
} from "./container-registration.js";

import type {
  InjectionToken,
  Token,
} from "./container-token.js";

import {
  unwrapToken,
} from "./container-token.js";

/**
 * Normalized registry token.
 */
export type RegistryToken<T = unknown> =
  | Token<T>
  | InjectionToken<T>;

/**
 * Registry change operation.
 */
export enum RegistryOperation {
  REGISTER = "register",
  REPLACE = "replace",
  REMOVE = "remove",
  CLEAR = "clear",
}

/**
 * Event emitted when the registry changes.
 */
export interface RegistryChangeEvent<T = unknown> {
  readonly operation:
    RegistryOperation;

  readonly token:
    RegistryToken<T>;

  readonly registration?:
    ContainerRegistration<T>;

  readonly previous?:
    ContainerRegistration<T>;

  readonly timestamp:
    Date;
}

/**
 * Registry subscription callback.
 */
export type RegistryListener<T = unknown> =
  (
    event:
      RegistryChangeEvent<T>,
  ) => void;

/**
 * Registry options.
 */
export interface ContainerRegistryOptions {
  /**
   * Whether duplicate registrations are allowed.
   *
   * Defaults to false.
   */
  readonly allowDuplicates?:
    boolean;
}

/**
 * Error thrown when a registration already exists and
 * duplicate registrations are disabled.
 */
export class DuplicateRegistrationError
  extends Error {
  readonly code =
    "CONTAINER_DUPLICATE_REGISTRATION";

  readonly token:
    Token<unknown>;

  constructor(
    token:
      Token<unknown>,
  ) {
    super(
      `A registration already exists for token: ${describeRegistryToken(token)}.`,
    );

    this.name =
      "DuplicateRegistrationError";

    this.token =
      token;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

/**
 * Error thrown when attempting to modify a registration
 * that does not exist.
 */
export class RegistrationNotFoundError
  extends Error {
  readonly code =
    "CONTAINER_REGISTRATION_NOT_FOUND";

  readonly token:
    Token<unknown>;

  constructor(
    token:
      Token<unknown>,
  ) {
    super(
      `No registration exists for token: ${describeRegistryToken(token)}.`,
    );

    this.name =
      "RegistrationNotFoundError";

    this.token =
      token;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

/**
 * Describes a token for registry diagnostics.
 */
function describeRegistryToken<T>(
  token:
    Token<T> |
    InjectionToken<T>,
):
  string {
  const normalized =
    unwrapToken(token);

  if (
    typeof normalized ===
    "string"
  ) {
    return normalized;
  }

  if (
    typeof normalized ===
    "symbol"
  ) {
    return normalized.description
      ? `Symbol(${normalized.description})`
      : "Symbol()";
  }

  return (
    normalized.name ||
    "AnonymousConstructor"
  );
}

/**
 * Container registration registry.
 */
export class ContainerRegistry {
  private readonly registrations =
    new Map<
      Token<unknown>,
      ContainerRegistration<unknown>
    >();

  private readonly listeners =
    new Set<
      RegistryListener
    >();

  private readonly allowDuplicates:
    boolean;

  constructor(
    options:
      ContainerRegistryOptions = {},
  ) {
    this.allowDuplicates =
      options.allowDuplicates ??
      false;
  }

  /**
   * Registers a dependency.
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
    const normalizedToken =
      unwrapToken(token);

    if (
      this.registrations.has(
        normalizedToken,
      ) &&
      !this.allowDuplicates
    ) {
      throw new DuplicateRegistrationError(
        normalizedToken,
      );
    }

    const registration =
      defineRegistration(
        normalizedToken,
        provider,
        options,
      );

    const previous =
      this.registrations.get(
        normalizedToken,
      );

    this.registrations.set(
      normalizedToken,
      registration as ContainerRegistration<unknown>,
    );

    this.emit({
      operation:
        previous
          ? RegistryOperation.REPLACE
          : RegistryOperation.REGISTER,

      token:
        normalizedToken,

      registration,

      previous,

      timestamp:
        new Date(),
    });

    return registration;
  }

  /**
   * Registers an already-created registration.
   */
  registerRegistration<T>(
    registration:
      ContainerRegistration<T>,
  ):
    ContainerRegistration<T> {
    const token =
      getRegistrationToken(
        registration,
      );

    if (
      this.registrations.has(
        token,
      ) &&
      !this.allowDuplicates
    ) {
      throw new DuplicateRegistrationError(
        token,
      );
    }

    const previous =
      this.registrations.get(
        token,
      );

    this.registrations.set(
      token,
      registration as ContainerRegistration<unknown>,
    );

    this.emit({
      operation:
        previous
          ? RegistryOperation.REPLACE
          : RegistryOperation.REGISTER,

      token,

      registration,

      previous,

      timestamp:
        new Date(),
    });

    return registration;
  }

  /**
   * Replaces an existing registration.
   */
  replace<T>(
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

    if (
      !this.registrations.has(
        normalizedToken,
      )
    ) {
      throw new RegistrationNotFoundError(
        normalizedToken,
      );
    }

    const previous =
      this.registrations.get(
        normalizedToken,
      );

    const registration =
      defineRegistration(
        normalizedToken,
        provider,
        options,
      );

    this.registrations.set(
      normalizedToken,
      registration as ContainerRegistration<unknown>,
    );

    this.emit({
      operation:
        RegistryOperation.REPLACE,

      token:
        normalizedToken,

      registration,

      previous,

      timestamp:
        new Date(),
    });

    return registration;
  }

  /**
   * Gets a registration.
   */
  get<T>(
    token:
      RegistrationToken<T>,
  ):
    ContainerRegistration<T> |
    undefined {
    const normalizedToken =
      unwrapToken(token);

    return this.registrations.get(
      normalizedToken,
    ) as
      | ContainerRegistration<T>
      | undefined;
  }

  /**
   * Gets a registration or throws.
   */
  getOrThrow<T>(
    token:
      RegistrationToken<T>,
  ):
    ContainerRegistration<T> {
    const registration =
      this.get(token);

    if (
      !registration
    ) {
      throw new RegistrationNotFoundError(
        unwrapToken(token),
      );
    }

    return registration;
  }

  /**
   * Determines whether a registration exists.
   */
  has<T>(
    token:
      RegistrationToken<T>,
  ):
    boolean {
    return this.registrations.has(
      unwrapToken(token),
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
    const normalizedToken =
      unwrapToken(token);

    const previous =
      this.registrations.get(
        normalizedToken,
      );

    if (
      !previous
    ) {
      return false;
    }

    const removed =
      this.registrations.delete(
        normalizedToken,
      );

    if (
      removed
    ) {
      this.emit({
        operation:
          RegistryOperation.REMOVE,

        token:
          normalizedToken,

        previous,

        timestamp:
          new Date(),
      });
    }

    return removed;
  }

  /**
   * Removes a registration or throws.
   */
  removeOrThrow<T>(
    token:
      RegistrationToken<T>,
  ):
    void {
    const normalizedToken =
      unwrapToken(token);

    if (
      !this.remove(
        normalizedToken,
      )
    ) {
      throw new RegistrationNotFoundError(
        normalizedToken,
      );
    }
  }

  /**
   * Returns the number of registrations.
   */
  get size():
    number {
    return this.registrations.size;
  }

  /**
   * Returns all registrations.
   */
  getAll():
    readonly ContainerRegistration[] {
    return [
      ...this.registrations.values(),
    ];
  }

  /**
   * Returns all registered tokens.
   */
  getTokens():
    readonly Token<unknown>[] {
    return [
      ...this.registrations.keys(),
    ];
  }

  /**
   * Finds registrations belonging to a module.
   */
  getByModule(
    module:
      string,
  ):
    readonly ContainerRegistration[] {
    return [
      ...this.registrations.values(),
    ].filter(
      (
        registration,
      ) =>
        registration.metadata.module ===
        module,
    );
  }

  /**
   * Finds registrations by scope.
   */
  getByScope(
    scope:
      ContainerScope,
  ):
    readonly ContainerRegistration[] {
    return [
      ...this.registrations.values(),
    ].filter(
      (
        registration,
      ) =>
        registration.scope ===
        scope,
    );
  }

  /**
   * Finds registrations matching a metadata predicate.
   */
  find(
    predicate:
      (
        registration:
          ContainerRegistration,
      ) => boolean,
  ):
    readonly ContainerRegistration[] {
    return [
      ...this.registrations.values(),
    ].filter(
      predicate,
    );
  }

  /**
   * Returns a registration's metadata.
   */
  getMetadata<T>(
    token:
      RegistrationToken<T>,
  ):
    RegistrationMetadata |
    undefined {
    return this.get(
      token,
    )?.metadata;
  }

  /**
   * Clears every registration.
   */
  clear():
    void {
    if (
      this.registrations.size ===
      0
    ) {
      return;
    }

    this.registrations.clear();

    this.emit({
      operation:
        RegistryOperation.CLEAR,

      token:
        Symbol.for(
          "lattice:container:registry",
        ),

      timestamp:
        new Date(),
    });
  }

  /**
   * Subscribes to registry changes.
   */
  subscribe(
    listener:
      RegistryListener,
  ):
    () => void {
    this.listeners.add(
      listener,
    );

    return () => {
      this.listeners.delete(
        listener,
      );
    };
  }

  /**
   * Removes all registry listeners.
   */
  clearListeners():
    void {
    this.listeners.clear();
  }

  /**
   * Emits a registry event.
   */
  private emit(
    event:
      RegistryChangeEvent,
  ):
    void {
    for (
      const listener of
      this.listeners
    ) {
      try {
        listener(
          event,
        );
      } catch {
        /*
         * Registry listeners are observers.
         *
         * A failing observer must not prevent the registry
         * operation itself from completing.
         */
      }
    }
  }

  /**
   * Creates a snapshot of the current registry.
   */
  snapshot():
    readonly ContainerRegistration[] {
    return this.getAll();
  }

  /**
   * Restores registrations from a snapshot.
   */
  restore(
    registrations:
      readonly ContainerRegistration[],
  ):
    void {
    this.registrations.clear();

    for (
      const registration of
      registrations
    ) {
      const token =
        getRegistrationToken(
          registration,
        );

      this.registrations.set(
        token,
        registration as ContainerRegistration<unknown>,
      );
    }
  }
}

/**
 * Creates a container registry.
 */
export function createContainerRegistry(
  options:
    ContainerRegistryOptions = {},
):
  ContainerRegistry {
  return new ContainerRegistry(
    options,
  );
}