import type { Logger } from "../../logging/core/logger.js";
import type { LifecycleComponent, LifecycleRegistration } from "../core/lifecycleRegistry.registry.js";
import { LifecycleRegistry } from "../core/lifecycleRegistry.registry.js";

/** Lifecycle scope state. */
export const LifecycleScopeState = {
  CREATED: "created",
  INITIALIZING: "initializing",
  INITIALIZED: "initialized",
  STARTING: "starting",
  RUNNING: "running",
  STOPPING: "stopping",
  STOPPED: "stopped",
  FAILED: "failed",
} as const;

export type LifecycleScopeState = (typeof LifecycleScopeState)[keyof typeof LifecycleScopeState];

/** Options used when creating a lifecycle scope. */
export interface LifecycleScopeOptions {
  readonly name: string;
  readonly parent?: LifecycleScope;
  readonly logger?: Logger;
  readonly continueOnShutdownError?: boolean;
}

/**
 * Represents an independently managed lifecycle boundary.
 * Can represent an Application, Module, Plugin, Worker, Service, or Feature.
 */
export class LifecycleScope {
  private state: LifecycleScopeState = LifecycleScopeState.CREATED;
  private readonly name: string;
  private readonly parent?: LifecycleScope;
  private readonly logger?: Logger;
  private readonly continueOnShutdownError: boolean;
  private readonly registry = new LifecycleRegistry();
  private readonly children: LifecycleScope[] = [];

  public constructor(options: LifecycleScopeOptions) {
    this.name = options.name;
    this.parent = options.parent;
    this.logger = options.logger;
    this.continueOnShutdownError = options.continueOnShutdownError ?? true;
    if (this.parent) this.parent.addChild(this);
  }

  public getName(): string { return this.name; }
  public getState(): LifecycleScopeState { return this.state; }
  public getParent(): LifecycleScope | undefined { return this.parent; }
  public getChildren(): readonly LifecycleScope[] { return [...this.children]; }
  public getRegistrations(): readonly LifecycleRegistration[] { return this.registry.getAll(); }

  public register(component: LifecycleComponent, name?: string): LifecycleRegistration {
    if (this.state !== LifecycleScopeState.CREATED && this.state !== LifecycleScopeState.INITIALIZED) {
      throw new Error(`Cannot register component in lifecycle scope "${this.name}" while state is "${this.state}".`);
    }
    return this.registry.register(component, name);
  }

  public unregister(id: string): boolean { return this.registry.unregister(id); }

  public async initialize(): Promise<void> {
    if (this.state === LifecycleScopeState.INITIALIZED || this.state === LifecycleScopeState.RUNNING) return;
    if (this.state !== LifecycleScopeState.CREATED) throw new Error(`Cannot initialize lifecycle scope "${this.name}" while state is "${this.state}".`);

    this.state = LifecycleScopeState.INITIALIZING;
    this.logger?.debug("Initializing lifecycle scope", { scope: this.name });

    try {
      for (const registration of this.registry.getAll()) {
        const component = registration.component;
        if ("onInitialize" in component && typeof component.onInitialize === "function") { await component.onInitialize(); }
        else if ("initialize" in component && typeof component.initialize === "function") { await component.initialize(); }
      }
      for (const child of this.children) await child.initialize();
      this.state = LifecycleScopeState.INITIALIZED;
      this.logger?.debug("Lifecycle scope initialized", { scope: this.name });
    } catch (error) {
      this.state = LifecycleScopeState.FAILED;
      this.logger?.error("Lifecycle scope initialization failed", error, { scope: this.name });
      throw error;
    }
  }

  public async start(): Promise<void> {
    if (this.state === LifecycleScopeState.RUNNING) return;
    if (this.state === LifecycleScopeState.CREATED) await this.initialize();
    if (this.state !== LifecycleScopeState.INITIALIZED) throw new Error(`Cannot start lifecycle scope "${this.name}" while state is "${this.state}".`);

    this.state = LifecycleScopeState.STARTING;
    this.logger?.debug("Starting lifecycle scope", { scope: this.name });

    try {
      for (const registration of this.registry.getAll()) {
        const component = registration.component;
        if ("onStart" in component && typeof component.onStart === "function") { await component.onStart(); }
        else if ("start" in component && typeof component.start === "function") { await component.start(); }
      }
      for (const child of this.children) await child.start();
      this.state = LifecycleScopeState.RUNNING;
      this.logger?.debug("Lifecycle scope started", { scope: this.name });
    } catch (error) {
      this.state = LifecycleScopeState.FAILED;
      this.logger?.error("Lifecycle scope startup failed", error, { scope: this.name });
      throw error;
    }
  }

  public async stop(): Promise<void> {
    if (this.state === LifecycleScopeState.STOPPED) return;
    if (this.state !== LifecycleScopeState.RUNNING && this.state !== LifecycleScopeState.FAILED) {
      throw new Error(`Cannot stop lifecycle scope "${this.name}" while state is "${this.state}".`);
    }

    this.state = LifecycleScopeState.STOPPING;
    const errors: unknown[] = [];
    this.logger?.debug("Stopping lifecycle scope", { scope: this.name });

    for (let i = this.children.length - 1; i >= 0; i--) {
      try { await this.children[i]!.stop(); } catch (error) { errors.push(error); if (!this.continueOnShutdownError) break; }
    }

    if (errors.length === 0 || this.continueOnShutdownError) {
      for (const registration of this.registry.getReverse()) {
        const component = registration.component;
        try {
          if ("onStop" in component && typeof component.onStop === "function") { await component.onStop(); }
          else if ("stop" in component && typeof component.stop === "function") { await component.stop(); }
        } catch (error) {
          errors.push(error);
          this.logger?.error("Lifecycle component failed to stop", error, { scope: this.name, component: registration.name });
          if (!this.continueOnShutdownError) break;
        }
      }
    }

    this.state = LifecycleScopeState.STOPPED;
    if (errors.length > 0) throw new AggregateError(errors, `Lifecycle scope "${this.name}" stopped with errors.`);
  }

  public async destroy(): Promise<void> {
    const errors: unknown[] = [];
    this.logger?.debug("Destroying lifecycle scope", { scope: this.name });

    for (let i = this.children.length - 1; i >= 0; i--) {
      try { await this.children[i]!.destroy(); } catch (error) { errors.push(error); if (!this.continueOnShutdownError) break; }
    }

    if (errors.length === 0 || this.continueOnShutdownError) {
      for (const registration of this.registry.getReverse()) {
        const component = registration.component;
        try {
          if ("onDestroy" in component && typeof component.onDestroy === "function") { await component.onDestroy(); }
          else if ("dispose" in component && typeof component.dispose === "function") { await component.dispose(); }
        } catch (error) {
          errors.push(error);
          this.logger?.error("Lifecycle component failed to destroy", error, { scope: this.name, component: registration.name });
          if (!this.continueOnShutdownError) break;
        }
      }
    }

    if (errors.length > 0) throw new AggregateError(errors, `Lifecycle scope "${this.name}" destroyed with errors.`);
  }

  public async shutdown(): Promise<void> {
    const errors: unknown[] = [];
    try { await this.stop(); } catch (error) { errors.push(error); }
    try { await this.destroy(); } catch (error) { errors.push(error); }
    if (errors.length > 0) throw new AggregateError(errors, `Lifecycle scope "${this.name}" shutdown completed with errors.`);
  }

  private addChild(child: LifecycleScope): void {
    if (this.children.includes(child)) return;
    this.children.push(child);
  }
}
