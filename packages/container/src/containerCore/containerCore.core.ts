/**
 * Core dependency injection container for Lattice.
 */

import type {
  ContainerProvider,
  ProviderToken,
} from "../containerProvider/containerProvider.core.js";
import {
  existingProvider,
  factoryProvider,
  valueProvider,
  classProvider,
} from "../containerProvider/containerProvider.core.js";
import { ContainerScope as Scope } from "../containerScope/containerScope.type.js";
import type {
  ContainerRegistration,
  CreateRegistrationOptions,
  RegistrationToken,
} from "../containerRegistration/containerRegistration.core.js";
import { ContainerRegistry } from "../containerRegistry/containerRegistry.core.js";
import { ContainerResolver } from "../containerResolution/containerResolution.core.js";
import {
  ContainerLifecycle,
  ContainerLifecycleOwner,
} from "../containerLifecycle/containerLifecycle.core.js";
import type {
  ContainerOptions,
  ResolvedContainerOptions,
} from "../containerOptions/containerOptions.type.js";
import { resolveContainerOptions } from "../containerOptions/containerOptions.type.js";
import type { ContainerScopeOptions } from "./containerCore.type.js";
import { ContainerScopeContext } from "./containerCore.scope.js";

export class Container {
  readonly name: string;
  readonly options: ResolvedContainerOptions;
  readonly registry: ContainerRegistry;
  readonly resolver: ContainerResolver;
  readonly lifecycle: ContainerLifecycle;
  private started = false;
  private disposed = false;

  constructor(options: ContainerOptions = {}) {
    this.options = resolveContainerOptions(options);
    this.name = this.options.name;
    this.registry = new ContainerRegistry(this.options.registry);
    this.resolver = new ContainerResolver(this.registry);
    this.lifecycle = new ContainerLifecycle(this.options.lifecycle);
  }

  start(): this {
    this.ensureNotDisposed();
    if (this.started) return this;
    this.started = true;
    return this;
  }

  register<T>(
    token: RegistrationToken<T>,
    provider: ContainerProvider<T>,
    options: CreateRegistrationOptions = {},
  ): ContainerRegistration<T> {
    this.ensureMutable();
    return this.registry.register(token, provider, options);
  }

  registerClass<T>(
    token: RegistrationToken<T>,
    ctor: new (...args: unknown[]) => T,
    options: CreateRegistrationOptions = {},
  ): ContainerRegistration<T> {
    return this.register(token, classProvider(ctor), options);
  }

  registerValue<T>(
    token: RegistrationToken<T>,
    value: T,
    options: CreateRegistrationOptions = {},
  ): ContainerRegistration<T> {
    return this.register(token, valueProvider(value), {
      ...options,
      scope: Scope.SINGLETON,
    });
  }

  registerFactory<T>(
    token: RegistrationToken<T>,
    factory: (...deps: unknown[]) => T,
    inject: readonly ProviderToken[] = [],
    options: CreateRegistrationOptions = {},
  ): ContainerRegistration<T> {
    return this.register(token, factoryProvider(factory, inject), options);
  }

  registerExisting<T>(
    token: RegistrationToken<T>,
    existing: ProviderToken<T>,
    options: CreateRegistrationOptions = {},
  ): ContainerRegistration<T> {
    return this.register(token, existingProvider(existing), options);
  }

  resolve<T>(token: RegistrationToken<T>): T {
    this.ensureActive();
    const result = this.resolver.resolveDetailed(token, this.resolutionOptions);
    this.lifecycle.track(
      result.token,
      result.value,
      ContainerLifecycleOwner.CONTAINER,
    );
    return result.value;
  }

  resolveMany<T>(tokens: readonly RegistrationToken<T>[]): T[] {
    return tokens.map((t) => this.resolve(t));
  }

  resolveOptional<T>(token: RegistrationToken<T>): T | undefined {
    if (!this.canResolve(token)) return undefined;
    return this.resolve(token);
  }

  canResolve<T>(token: RegistrationToken<T>): boolean {
    this.ensureNotDisposed();
    return this.resolver.canResolve(token);
  }
  has<T>(token: RegistrationToken<T>): boolean {
    this.ensureNotDisposed();
    return this.registry.has(token);
  }

  getRegistration<T>(
    token: RegistrationToken<T>,
  ): ContainerRegistration<T> | undefined {
    this.ensureNotDisposed();
    return this.registry.get(token);
  }

  remove<T>(token: RegistrationToken<T>): boolean {
    this.ensureMutable();
    return this.registry.remove(token);
  }

  createScope(options: ContainerScopeOptions = {}): ContainerScopeContext {
    this.ensureActive();
    if (!this.options.allowScopes)
      throw new Error("Container scopes are disabled.");
    return new ContainerScopeContext(this, options);
  }

  getRegistrations(): readonly ContainerRegistration[] {
    this.ensureNotDisposed();
    return this.registry.getAll();
  }
  get registrationCount(): number {
    return this.registry.size;
  }
  isStarted(): boolean {
    return this.started;
  }
  isDisposed(): boolean {
    return this.disposed;
  }
  clearSingletons(): void {
    this.ensureActive();
    this.resolver.clearSingletons();
  }

  async dispose(): Promise<void> {
    if (this.disposed) return;
    try {
      if (this.options.autoDispose) await this.lifecycle.disposeContainer();
      else this.lifecycle.reset();
    } finally {
      this.resolver.clearSingletons();
      this.disposed = true;
      this.started = false;
    }
  }

  get resolutionOptions(): {
    autoRegisterClasses: boolean;
    detectCircularDependencies: boolean;
    maxResolutionDepth: number;
  } {
    return {
      autoRegisterClasses: this.options.resolution.autoRegisterClasses ?? true,
      detectCircularDependencies:
        this.options.resolution.detectCircularDependencies ?? true,
      maxResolutionDepth: this.options.resolution.maxResolutionDepth ?? 100,
    };
  }

  private ensureActive(): void {
    this.ensureNotDisposed();
    if (!this.started) this.start();
  }
  private ensureNotDisposed(): void {
    if (this.disposed)
      throw new Error(`Container "${this.name}" has already been disposed.`);
  }
  private ensureMutable(): void {
    this.ensureNotDisposed();
    if (!this.options.freezeRegistrations) return;
    if (this.started)
      throw new Error(`Registrations for container "${this.name}" are frozen.`);
  }
}

export function createContainer(options: ContainerOptions = {}): Container {
  return new Container(options);
}
export function createStartedContainer(
  options: ContainerOptions = {},
): Container {
  return new Container(options).start();
}
