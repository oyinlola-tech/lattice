/**
 * Lifecycle management for resolved container instances.
 * Tracks instances that need cleanup and disposes them when a container or scope is destroyed.
 */

import type { Token } from "../containerToken/containerToken.type.js";
import { describeToken } from "../containerToken/containerToken.type.js";
import { ContainerLifecycleError } from "@oyinlola141/lattice-errors";

export interface Disposable { dispose(): void; }
export interface AsyncDisposable { [Symbol.asyncDispose]?: () => Promise<void>; }
export type DisposableInstance = Disposable | AsyncDisposable;

export enum ContainerLifecycleOwner {
  CONTAINER = "container",
  SCOPE = "scope",
}

export interface TrackedInstance<T = unknown> {
  readonly token: Token<T>;
  readonly instance: T;
  readonly owner: ContainerLifecycleOwner;
  disposed: boolean;
  readonly trackedAt: Date;
}

export interface ContainerLifecycleOptions {
  readonly failFast?: boolean;
}

export class ContainerDisposalError extends ContainerLifecycleError {
  readonly errors: readonly unknown[];
  readonly tokens: readonly Token<unknown>[];
  constructor(errors: readonly unknown[], tokens: readonly Token<unknown>[]) {
    super("disposal", `Failed to dispose ${errors.length} container instance(s): ${tokens.map(describeToken).join(", ")}.`);
    this.errors = errors;
    this.tokens = tokens;
  }
}

export function isDisposable(value: unknown): value is Disposable {
  return typeof value === "object" && value !== null && "dispose" in value && typeof (value as { dispose?: unknown }).dispose === "function";
}

export function isAsyncDisposable(value: unknown): value is AsyncDisposable {
  return typeof value === "object" && value !== null && Symbol.asyncDispose in value && typeof (value as AsyncDisposable)[Symbol.asyncDispose] === "function";
}

export function isDisposableInstance(value: unknown): value is DisposableInstance {
  return isDisposable(value) || isAsyncDisposable(value);
}

export class ContainerLifecycle {
  private readonly instances = new Map<Token<unknown>, TrackedInstance<unknown>>();
  private readonly options: Required<ContainerLifecycleOptions>;
  private disposed = false;

  constructor(options: ContainerLifecycleOptions = {}) {
    this.options = { failFast: options.failFast ?? false };
  }

  track<T>(token: Token<T>, instance: T, owner: ContainerLifecycleOwner = ContainerLifecycleOwner.CONTAINER): void {
    if (this.disposed) throw new Error("Cannot track an instance after the container lifecycle has been disposed.");
    if (!isDisposableInstance(instance)) return;
    this.instances.set(token, { token, instance, owner, disposed: false, trackedAt: new Date() });
  }

  has<T>(token: Token<T>): boolean { return this.instances.has(token); }
  get<T>(token: Token<T>): TrackedInstance<T> | undefined { return this.instances.get(token) as TrackedInstance<T> | undefined; }
  getAll(): readonly TrackedInstance[] { return [...this.instances.values()]; }
  get size(): number { return this.instances.size; }
  untrack<T>(token: Token<T>): boolean { return this.instances.delete(token); }

  async disposeInstance<T>(token: Token<T>): Promise<void> {
    const tracked = this.get(token);
    if (!tracked || tracked.disposed) return;
    try { await disposeValue(tracked.instance); tracked.disposed = true; this.instances.delete(token); }
    catch (error) { if (this.options.failFast) throw error; throw new ContainerDisposalError([error], [token]); }
  }

  async dispose(owner?: ContainerLifecycleOwner): Promise<void> {
    if (this.disposed) return;
    const tracked = [...this.instances.values()].reverse();
    const selected = owner ? tracked.filter((entry) => entry.owner === owner) : tracked;
    const errors: unknown[] = [];
    const failedTokens: Token<unknown>[] = [];
    for (const entry of selected) {
      if (entry.disposed) continue;
      try { await disposeValue(entry.instance); entry.disposed = true; this.instances.delete(entry.token); }
      catch (error) { errors.push(error); failedTokens.push(entry.token); if (this.options.failFast) break; }
    }
    if (errors.length > 0) throw new ContainerDisposalError(errors, failedTokens);
    if (owner === undefined) this.disposed = true;
  }

  async disposeScope(): Promise<void> { await this.dispose(ContainerLifecycleOwner.SCOPE); }
  async disposeContainer(): Promise<void> { await this.dispose(ContainerLifecycleOwner.CONTAINER); }
  isDisposed(): boolean { return this.disposed; }
  reset(): void { this.instances.clear(); this.disposed = false; }
  getTrackedTokens(): readonly Token<unknown>[] { return [...this.instances.keys()]; }
}

async function disposeValue(value: unknown): Promise<void> {
  if (isAsyncDisposable(value)) { await value[Symbol.asyncDispose]!(); return; }
  if (isDisposable(value)) { value.dispose(); return; }
}

export function createContainerLifecycle(options: ContainerLifecycleOptions = {}): ContainerLifecycle {
  return new ContainerLifecycle(options);
}
