/**
 * Dependency resolver for Lattice.
 */

import type {
  ContainerProvider,
} from "../containerProvider/containerProvider.core.js";

import {
  isClassProvider,
  isExistingProvider,
  isFactoryProvider,
  isValueProvider,
  normalizeProvider,
} from "../containerProvider/containerProvider.core.js";

import {
  ContainerScope as Scope,
} from "../containerScope/containerScope.type.js";

import type {
  ContainerRegistration,
  RegistrationToken,
} from "../containerRegistration/containerRegistration.core.js";

import {
  getRegistrationToken,
} from "../containerRegistration/containerRegistration.core.js";

import type {
  ContainerRegistry,
} from "../containerRegistry/containerRegistry.core.js";

import {
  RegistrationNotFoundError,
} from "../containerRegistry/containerRegistry.error.js";

import {
  unwrapToken,
} from "../containerToken/containerToken.type.js";

import type {
  Token,
} from "../containerToken/containerToken.type.js";

import type {
  ResolutionCache,
  ResolutionOptions,
  ResolutionPath,
  ResolutionResult,
} from "./containerResolution.type.js";

import {
  CircularDependencyError,
  ProviderResolutionError,
} from "./containerResolution.error.js";

export class ContainerResolver {
  private readonly registry: ContainerRegistry;
  private readonly singletonCache: ResolutionCache;

  constructor(registry: ContainerRegistry) {
    this.registry = registry;
    this.singletonCache = new Map();
  }

  resolve<T>(token: RegistrationToken<T>, options: ResolutionOptions = {}): T {
    return this.resolveDetailed(token, options).value;
  }

  resolveDetailed<T>(token: RegistrationToken<T>, options: ResolutionOptions = {}): ResolutionResult<T> {
    const normalized = unwrapToken(token);
    const cache = options.cache ?? this.singletonCache;
    const path = options.path ?? [];
    return this.resolveInternal(normalized, cache, path, options);
  }

  private resolveInternal<T>(token: Token<T>, cache: ResolutionCache, path: ResolutionPath, options: ResolutionOptions): ResolutionResult<T> {
    if (path.includes(token)) throw new CircularDependencyError([...path, token]);

    const registration = this.registry.get(token);
    if (!registration) {
      if (options.autoRegisterClasses !== false && typeof token === "function") {
        this.registry.register(token, { useClass: token }, { scope: Scope.TRANSIENT });
        return this.resolveInternal(token, cache, path, { ...options, autoRegisterClasses: false });
      }
      throw new RegistrationNotFoundError(token);
    }

    const currentPath: ResolutionPath = [...path, token];
    if (registration.scope !== Scope.TRANSIENT) {
      const cached = cache.get(token);
      if (cached !== undefined) {
        return { value: cached as T, token, registration, scope: registration.scope, fromCache: true, path: currentPath };
      }
    }

    const value = this.createInstance(registration, cache, currentPath, options);
    if (registration.scope === Scope.SINGLETON) this.singletonCache.set(token, value);
    else if (registration.scope === Scope.SCOPED) cache.set(token, value);

    return { value, token, registration, scope: registration.scope, fromCache: false, path: currentPath };
  }

  private createInstance<T>(registration: ContainerRegistration<T>, cache: ResolutionCache, path: ResolutionPath, options: ResolutionOptions): T {
    const provider = normalizeProvider(registration.provider);
    try {
      if (isValueProvider(provider)) return provider.useValue;
      if (isExistingProvider(provider)) return this.resolve(provider.useExisting, { ...options, cache, path });
      if (isFactoryProvider(provider)) return this.createFromFactory(provider, cache, path, options);
      if (isClassProvider(provider)) return this.createFromClass(provider.useClass);
      throw new Error("Unsupported container provider.");
    } catch (error) {
      if (error instanceof CircularDependencyError || error instanceof ProviderResolutionError) throw error;
      throw new ProviderResolutionError(getRegistrationToken(registration), error);
    }
  }

  private createFromFactory<T>(
    provider: Extract<ContainerProvider<T>, { useFactory: (...args: unknown[]) => T }>,
    cache: ResolutionCache,
    path: ResolutionPath,
    options: ResolutionOptions,
  ): T {
    const deps = provider.inject ?? [];
    return provider.useFactory(...deps.map((d) => this.resolve(d, { ...options, cache, path })));
  }

  private createFromClass<T>(constructor: new (...args: unknown[]) => T): T {
    return new constructor();
  }

  createScope(): ResolutionCache { return new Map(); }
  clearSingletons(): void { this.singletonCache.clear(); }
  hasSingleton<T>(token: RegistrationToken<T>): boolean { return this.singletonCache.has(unwrapToken(token)); }
  getSingleton<T>(token: RegistrationToken<T>): T | undefined { return this.singletonCache.get(unwrapToken(token)) as T | undefined; }
  removeSingleton<T>(token: RegistrationToken<T>): boolean { return this.singletonCache.delete(unwrapToken(token)); }
  clearScope(cache: ResolutionCache): void { cache.clear(); }

  resolveMany<T>(tokens: readonly RegistrationToken<T>[], options: ResolutionOptions = {}): T[] {
    return tokens.map((t) => this.resolve(t, options));
  }

  canResolve<T>(token: RegistrationToken<T>): boolean {
    const t = unwrapToken(token);
    return this.registry.has(t) || typeof t === "function";
  }
}
