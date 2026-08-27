/**
 * Lifecycle management for resolved container instances.
 *
 * Responsible for tracking instances that need cleanup and
 * disposing them when a container or scope is destroyed.
 *
 * This module does not create instances and does not own
 * registrations. Resolution remains the responsibility of
 * ContainerResolver.
 */

import type {
  Token,
} from "../containerToken/containerToken.type.js";

import {
  describeToken,
} from "../containerToken/containerToken.type.js";

/**
 * An object that can synchronously dispose itself.
 */
export interface Disposable {
  dispose():
    void;
}

/**
 * An object that can asynchronously dispose itself.
 */
export interface AsyncDisposable {
  [Symbol.asyncDispose]?:
    () => Promise<void>;
}

/**
 * An object that supports either synchronous or asynchronous
 * cleanup.
 */
export type DisposableInstance =
  | Disposable
  | AsyncDisposable;

/**
 * Lifecycle ownership of a tracked instance.
 */
export enum ContainerLifecycleOwner {
  /**
   * Instance belongs to the root container.
   */
  CONTAINER = "container",

  /**
   * Instance belongs to a child resolution scope.
   */
  SCOPE = "scope",
}

/**
 * Information about a tracked instance.
 */
export interface TrackedInstance<T = unknown> {
  /**
   * Dependency token associated with the instance.
   */
  readonly token:
    Token<T>;

  /**
   * The resolved instance.
   */
  readonly instance:
    T;

  /**
   * Lifecycle owner.
   */
  readonly owner:
    ContainerLifecycleOwner;

  /**
   * Whether cleanup has already occurred.
   */
  disposed:
    boolean;

  /**
   * When the instance was registered with the lifecycle.
   */
  readonly trackedAt:
    Date;
}

/**
 * Lifecycle disposal options.
 */
export interface ContainerLifecycleOptions {
  /**
   * Whether disposal failures should stop disposal of the
   * remaining instances.
   *
   * Defaults to false.
   */
  readonly failFast?:
    boolean;
}

/**
 * Error thrown when one or more instances fail to dispose.
 */
export class ContainerDisposalError
  extends Error {
  readonly code =
    "CONTAINER_DISPOSAL_FAILED";

  readonly errors:
    readonly unknown[];

  readonly tokens:
    readonly Token<unknown>[];

  constructor(
    errors:
      readonly unknown[],
    tokens:
      readonly Token<unknown>[],
  ) {
    const tokenNames =
      tokens
        .map(
          describeToken,
        )
        .join(", ");

    super(
      `Failed to dispose ${errors.length} container instance(s): ${tokenNames}.`,
    );

    this.name =
      "ContainerDisposalError";

    this.errors =
      errors;

    this.tokens =
      tokens;

    Object.setPrototypeOf(
      this,
      new.target.prototype,
    );
  }
}

/**
 * Determines whether an object supports synchronous disposal.
 */
export function isDisposable(
  value:
    unknown,
):
  value is Disposable {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    "dispose" in value &&
    typeof (
      value as {
        dispose?:
          unknown;
      }
    ).dispose ===
      "function"
  );
}

/**
 * Determines whether an object supports asynchronous disposal.
 */
export function isAsyncDisposable(
  value:
    unknown,
):
  value is AsyncDisposable {
  return (
    typeof value ===
      "object" &&
    value !== null &&
    Symbol.asyncDispose in value &&
    typeof (
      value as AsyncDisposable
    )[Symbol.asyncDispose] ===
      "function"
  );
}

/**
 * Determines whether an instance supports any known
 * disposal protocol.
 */
export function isDisposableInstance(
  value:
    unknown,
):
  value is DisposableInstance {
  return (
    isDisposable(value) ||
    isAsyncDisposable(value)
  );
}

/**
 * Container lifecycle manager.
 */
export class ContainerLifecycle {
  private readonly instances =
    new Map<
      Token<unknown>,
      TrackedInstance<unknown>
    >();

  private readonly options:
    Required<
      ContainerLifecycleOptions
    >;

  private disposed =
    false;

  constructor(
    options:
      ContainerLifecycleOptions = {},
  ) {
    this.options = {
      failFast:
        options.failFast ??
        false,
    };
  }

  /**
   * Tracks a resolved instance.
   *
   * Only disposable instances need to be tracked.
   */
  track<T>(
    token:
      Token<T>,
    instance:
      T,
    owner:
      ContainerLifecycleOwner =
        ContainerLifecycleOwner.CONTAINER,
  ):
    void {
    if (
      this.disposed
    ) {
      throw new Error(
        "Cannot track an instance after the container lifecycle has been disposed.",
      );
    }

    if (
      !isDisposableInstance(
        instance,
      )
    ) {
      return;
    }

    this.instances.set(
      token,
      {
        token,

        instance,

        owner,

        disposed:
          false,

        trackedAt:
          new Date(),
      },
    );
  }

  /**
   * Returns whether an instance is being tracked.
   */
  has<T>(
    token:
      Token<T>,
  ):
    boolean {
    return this.instances.has(
      token,
    );
  }

  /**
   * Gets tracked instance information.
   */
  get<T>(
    token:
      Token<T>,
  ):
    TrackedInstance<T> |
    undefined {
    return this.instances.get(
      token,
    ) as
      | TrackedInstance<T>
      | undefined;
  }

  /**
   * Returns all tracked instances.
   */
  getAll():
    readonly TrackedInstance[] {
    return [
      ...this.instances.values(),
    ];
  }

  /**
   * Returns the number of tracked instances.
   */
  get size():
    number {
    return this.instances.size;
  }

  /**
   * Untracks an instance without disposing it.
   *
   * This should only be used when ownership has been
   * deliberately transferred elsewhere.
   */
  untrack<T>(
    token:
      Token<T>,
  ):
    boolean {
    return this.instances.delete(
      token,
    );
  }

  /**
   * Disposes one tracked instance.
   */
  async disposeInstance<T>(
    token:
      Token<T>,
  ):
    Promise<void> {
    const tracked =
      this.get(token);

    if (
      !tracked ||
      tracked.disposed
    ) {
      return;
    }

    try {
      await disposeValue(
        tracked.instance,
      );

      tracked.disposed =
        true;

      this.instances.delete(
        token,
      );
    } catch (
      error
    ) {
      if (
        this.options.failFast
      ) {
        throw error;
      }

      throw new ContainerDisposalError(
        [error],
        [token],
      );
    }
  }

  /**
   * Disposes all tracked instances.
   *
   * Instances are disposed in reverse registration order.
   * This approximates dependency teardown order.
   */
  async dispose(
    owner?:
      ContainerLifecycleOwner,
  ):
    Promise<void> {
    if (
      this.disposed
    ) {
      return;
    }

    const tracked =
      [
        ...this.instances.values(),
      ].reverse();

    const selected =
      owner
        ? tracked.filter(
            (
              entry,
            ) =>
              entry.owner ===
              owner,
          )
        : tracked;

    const errors:
      unknown[] = [];

    const failedTokens:
      Token<unknown>[] = [];

    for (
      const entry of selected
    ) {
      if (
        entry.disposed
      ) {
        continue;
      }

      try {
        await disposeValue(
          entry.instance,
        );

        entry.disposed =
          true;

        this.instances.delete(
          entry.token,
        );
      } catch (
        error
      ) {
        errors.push(
          error,
        );

        failedTokens.push(
          entry.token,
        );

        if (
          this.options.failFast
        ) {
          break;
        }
      }
    }

    if (
      errors.length > 0
    ) {
      throw new ContainerDisposalError(
        errors,
        failedTokens,
      );
    }

    if (
      owner ===
        undefined
    ) {
      this.disposed =
        true;
    }
  }

  /**
   * Disposes only instances belonging to a child scope.
   */
  async disposeScope():
    Promise<void> {
    await this.dispose(
      ContainerLifecycleOwner.SCOPE,
    );
  }

  /**
   * Disposes only instances owned by the root container.
   */
  async disposeContainer():
    Promise<void> {
    await this.dispose(
      ContainerLifecycleOwner.CONTAINER,
    );
  }

  /**
   * Determines whether the lifecycle manager has been disposed.
   */
  isDisposed():
    boolean {
    return this.disposed;
  }

  /**
   * Resets the lifecycle manager.
   *
   * This should only be used by controlled container
   * reinitialization flows.
   */
  reset():
    void {
    this.instances.clear();

    this.disposed =
      false;
  }

  /**
   * Returns the tokens of currently tracked instances.
   */
  getTrackedTokens():
    readonly Token<unknown>[] {
    return [
      ...this.instances.keys(),
    ];
  }
}

/**
 * Executes the appropriate disposal protocol.
 *
 * Async disposal takes precedence over synchronous disposal.
 */
async function disposeValue(
  value:
    unknown,
):
  Promise<void> {
  if (
    isAsyncDisposable(value)
  ) {
    await value[
      Symbol.asyncDispose
    ]!();

    return;
  }

  if (
    isDisposable(value)
  ) {
    value.dispose();

    return;
  }
}

/**
 * Creates a lifecycle manager.
 */
export function createContainerLifecycle(
  options:
    ContainerLifecycleOptions = {},
):
  ContainerLifecycle {
  return new ContainerLifecycle(
    options,
  );
}