/**
 * Container registration registry.
 */

import type { ContainerProvider } from "../containerProvider/containerProvider.core.js";

import type { ContainerScope } from "../containerScope/containerScope.type.js";

import type {
  ContainerRegistration,
  CreateRegistrationOptions,
  RegistrationMetadata,
  RegistrationToken,
} from "../containerRegistration/containerRegistration.core.js";

import {
  defineRegistration,
  getRegistrationToken,
} from "../containerRegistration/containerRegistration.core.js";

import type { Token } from "../containerToken/containerToken.type.js";

import { unwrapToken } from "../containerToken/containerToken.type.js";

import type {
  ContainerRegistryOptions,
  RegistryChangeEvent,
  RegistryListener,
} from "./containerRegistry.type.js";

import { RegistryOperation } from "./containerRegistry.type.js";

import {
  DuplicateRegistrationError,
  RegistrationNotFoundError,
} from "@zudoliblib/errors";
import { describeRegistryToken } from "./containerRegistry.error.js";

export class ContainerRegistry {
  private readonly registrations = new Map<
    Token<unknown>,
    ContainerRegistration<unknown>
  >();
  private readonly listeners = new Set<RegistryListener>();
  private readonly allowDuplicates: boolean;

  constructor(options: ContainerRegistryOptions = {}) {
    this.allowDuplicates = options.allowDuplicates ?? false;
  }

  register<T>(
    token: RegistrationToken<T>,
    provider: ContainerProvider<T>,
    options: CreateRegistrationOptions = {},
  ): ContainerRegistration<T> {
    const t = unwrapToken(token);
    if (this.registrations.has(t) && !this.allowDuplicates)
      throw new DuplicateRegistrationError(describeRegistryToken(t));
    const prev = this.registrations.get(t);
    const reg = defineRegistration(t, provider, options);
    this.registrations.set(t, reg as ContainerRegistration<unknown>);
    this.emit({
      operation: prev ? RegistryOperation.REPLACE : RegistryOperation.REGISTER,
      token: t,
      registration: reg,
      previous: prev,
      timestamp: new Date(),
    });
    return reg;
  }

  registerRegistration<T>(
    registration: ContainerRegistration<T>,
  ): ContainerRegistration<T> {
    const t = getRegistrationToken(registration);
    if (this.registrations.has(t) && !this.allowDuplicates)
      throw new DuplicateRegistrationError(describeRegistryToken(t));
    const prev = this.registrations.get(t);
    this.registrations.set(t, registration as ContainerRegistration<unknown>);
    this.emit({
      operation: prev ? RegistryOperation.REPLACE : RegistryOperation.REGISTER,
      token: t,
      registration,
      previous: prev,
      timestamp: new Date(),
    });
    return registration;
  }

  replace<T>(
    token: RegistrationToken<T>,
    provider: ContainerProvider<T>,
    options: CreateRegistrationOptions = {},
  ): ContainerRegistration<T> {
    const t = unwrapToken(token);
    if (!this.registrations.has(t))
      throw new RegistrationNotFoundError(describeRegistryToken(t));
    const prev = this.registrations.get(t);
    const reg = defineRegistration(t, provider, options);
    this.registrations.set(t, reg as ContainerRegistration<unknown>);
    this.emit({
      operation: RegistryOperation.REPLACE,
      token: t,
      registration: reg,
      previous: prev,
      timestamp: new Date(),
    });
    return reg;
  }

  get<T>(token: RegistrationToken<T>): ContainerRegistration<T> | undefined {
    return this.registrations.get(unwrapToken(token)) as
      ContainerRegistration<T> | undefined;
  }

  getOrThrow<T>(token: RegistrationToken<T>): ContainerRegistration<T> {
    const r = this.get(token);
    if (!r)
      throw new RegistrationNotFoundError(
        describeRegistryToken(unwrapToken(token)),
      );
    return r;
  }

  has<T>(token: RegistrationToken<T>): boolean {
    return this.registrations.has(unwrapToken(token));
  }

  remove<T>(token: RegistrationToken<T>): boolean {
    const t = unwrapToken(token);
    const prev = this.registrations.get(t);
    if (!prev) return false;
    const removed = this.registrations.delete(t);
    if (removed)
      this.emit({
        operation: RegistryOperation.REMOVE,
        token: t,
        previous: prev,
        timestamp: new Date(),
      });
    return removed;
  }

  removeOrThrow<T>(token: RegistrationToken<T>): void {
    if (!this.remove(unwrapToken(token)))
      throw new RegistrationNotFoundError(
        describeRegistryToken(unwrapToken(token)),
      );
  }

  get size(): number {
    return this.registrations.size;
  }

  getAll(): readonly ContainerRegistration[] {
    return [...this.registrations.values()];
  }

  getTokens(): readonly Token<unknown>[] {
    return [...this.registrations.keys()];
  }

  getByModule(module: string): readonly ContainerRegistration[] {
    return [...this.registrations.values()].filter(
      (r) => r.metadata.module === module,
    );
  }

  getByScope(scope: ContainerScope): readonly ContainerRegistration[] {
    return [...this.registrations.values()].filter((r) => r.scope === scope);
  }

  find(
    predicate: (r: ContainerRegistration) => boolean,
  ): readonly ContainerRegistration[] {
    return [...this.registrations.values()].filter(predicate);
  }

  getMetadata<T>(
    token: RegistrationToken<T>,
  ): RegistrationMetadata | undefined {
    return this.get(token)?.metadata;
  }

  clear(): void {
    if (this.registrations.size === 0) return;
    this.registrations.clear();
    this.emit({
      operation: RegistryOperation.CLEAR,
      token: Symbol.for("zudolib:container:registry"),
      timestamp: new Date(),
    });
  }

  subscribe(listener: RegistryListener): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  clearListeners(): void {
    this.listeners.clear();
  }

  private emit(event: RegistryChangeEvent): void {
    for (const l of this.listeners) {
      try {
        l(event);
      } catch {
        /* noop */
      }
    }
  }

  snapshot(): readonly ContainerRegistration[] {
    return this.getAll();
  }

  restore(regs: readonly ContainerRegistration[]): void {
    this.registrations.clear();
    for (const r of regs)
      this.registrations.set(
        getRegistrationToken(r),
        r as ContainerRegistration<unknown>,
      );
  }
}
