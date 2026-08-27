/**
 * ContainerScopeContext — child dependency scope with
 * its own scoped-instance cache.
 */

import type {
  RegistrationToken,
} from "../containerRegistration/containerRegistration.core.js";

import {
  ContainerLifecycle,
  ContainerLifecycleOwner,
} from "../containerLifecycle/containerLifecycle.core.js";

import type {
  ResolutionCache,
} from "../containerResolution/containerResolution.type.js";

import type {
  Token,
} from "../containerToken/containerToken.type.js";

import type {
  ContainerScopeOptions,
  ContainerLike,
} from "./containerCore.type.js";

/**
 * Represents a child dependency scope.
 *
 * A scope has its own scoped-instance cache while sharing
 * registrations and singleton instances with its parent.
 */
export class ContainerScopeContext {
  private disposed = false;
  private readonly cache: ResolutionCache;
  private readonly lifecycle: ContainerLifecycle;
  readonly name: string;
  readonly metadata: Readonly<Record<string, unknown>>;

  constructor(
    private readonly parent: ContainerLike,
    options: ContainerScopeOptions = {},
  ) {
    this.name = options.name ?? `${parent.name}:scope`;
    this.metadata = Object.freeze({ ...(options.metadata ?? {}) });
    this.cache = parent.resolver.createScope();
    this.lifecycle = new ContainerLifecycle();
  }

  /**
   * Resolves a dependency within this scope.
   */
  resolve<T>(token: RegistrationToken<T>): T {
    this.ensureActive();
    const result = this.parent.resolver.resolveDetailed(token, {
      ...this.parent.resolutionOptions,
      cache: this.cache,
    });
    this.lifecycle.track(result.token as Token, result.value, ContainerLifecycleOwner.SCOPE);
    return result.value as T;
  }

  /**
   * Resolves multiple dependencies within this scope.
   */
  resolveMany<T>(tokens: readonly RegistrationToken<T>[]): T[] {
    return tokens.map((token) => this.resolve(token));
  }

  /**
   * Checks whether a dependency can be resolved.
   */
  canResolve<T>(token: RegistrationToken<T>): boolean {
    this.ensureActive();
    return this.parent.resolver.canResolve(token);
  }

  /**
   * Checks whether a registration exists.
   */
  has<T>(token: RegistrationToken<T>): boolean {
    this.ensureActive();
    return this.parent.has(token);
  }

  /**
   * Creates another nested scope.
   */
  createScope(options: ContainerScopeOptions = {}): ContainerScopeContext {
    this.ensureActive();
    return this.parent.createScope(options);
  }

  /**
   * Disposes all instances belonging to this scope.
   */
  async dispose(): Promise<void> {
    if (this.disposed) return;
    try {
      await this.lifecycle.disposeScope();
    } finally {
      this.cache.clear();
      this.disposed = true;
    }
  }

  /**
   * Returns whether the scope has been disposed.
   */
  isDisposed(): boolean {
    return this.disposed;
  }

  /**
   * Returns the parent container.
   */
  getParent(): ContainerLike {
    return this.parent;
  }

  /**
   * Throws when the scope is no longer active.
   */
  private ensureActive(): void {
    if (this.disposed) {
      throw new Error(`Container scope "${this.name}" has already been disposed.`);
    }
  }
}
